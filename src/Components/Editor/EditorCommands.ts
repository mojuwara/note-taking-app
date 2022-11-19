import { TableHelper } from "./TableHelper";
import { CustomEditor, ElementTypes, ImageElement } from "../../Types";

import { Editor, Transforms, Element as SlateElement, Node, NodeEntry, Path, Range } from 'slate'

// Truen if the element exists just to wrap other elements(Ex with <ul>: <ul><li>...</li></ul>)
export const isListType = (blk: string) => ["unorderedList", "orderedList"].includes(blk);

// Helper functions we can reuse
const EditorCommands = {
	// Call this func instead of calling Transforms.select() or Transforms.insertNodes() directly
	// Before updating the editors contents and selection, this function will call
	// onDeslected() on elements that will no longer be selected
	// After updating the editors contents and selection, newly selected elements will
	// have their onSelected() function called
	updateSelectedElem(editor: CustomEditor, newSel: Range, updateFn?: () => void) {
		if (!editor.selection?.focus.path)
			return;

		// call onDeselected() for all nodes down current path
		EditorCommands.checkDeselectedElems(editor, editor.selection);

		if (updateFn)
			updateFn();
		Transforms.select(editor, newSel);

		// call onSelected() for all nodes down new path
		EditorCommands.checkSelectedElems(editor, newSel);
	},

	handleSelectionChange(editor: CustomEditor, oldSel: Range | null) {
		if (!editor.selection?.focus.path)
			return;

		// If no old selection, call onSelected() for all nodes down path
		if (!oldSel) {
			EditorCommands.checkSelectedElems(editor, editor.selection);
			return;
		}

		// call onDeselected() for all old nodes and onSelected on new selected nodes
		EditorCommands.checkDeselectedElems(editor, oldSel);
		EditorCommands.checkSelectedElems(editor, editor.selection);
	},

	checkSelectedElems(editor: CustomEditor, selection: Range) {
		for (let i = 1; i <= selection.focus.path.length; i++) {
			const [selectedNode, selectedNodePath] = Editor.node(editor, selection.focus.path.slice(0, i));
			if (SlateElement.isElement(selectedNode) && (selectedNode.type === "table-data" || selectedNode.type === "table-header"))
				TableHelper.onTableSelected(editor, [selectedNode, selectedNodePath]);
		}
	},

	checkDeselectedElems(editor: CustomEditor, oldSel: Range) {
		for (let i = 1; i <= oldSel.focus.path.length; i++) {
			const [deselectedNode, deselectedNodePath] = Editor.node(editor, oldSel.focus.path.slice(0, i));
			if (SlateElement.isElement(deselectedNode) && deselectedNode.type === ElementTypes.TABLE)
				TableHelper.onTableDeselected(editor, [deselectedNode, deselectedNodePath]);
		}
	},

	getLocAfterParent(editor: CustomEditor) {
		const selectionPath = editor.selection?.focus.path.slice();
		if (!selectionPath || !selectionPath.length)
			return;

		// Move selection to the next element in this paragraph
		selectionPath.pop();
		selectionPath[selectionPath.length - 1]++;

		return {
			anchor: { path: selectionPath, offset: 0 },
			focus: { path: selectionPath, offset: 0 }
		};
	},

	getLocAfterInlineInsert(editor: CustomEditor) {
		const path = editor.selection?.focus.path.slice();
		if (!path)
			return;

		// Want to land at the text node if an in inline elem were to be inserted here, so +2
		path[path.length - 1] += 2;
		return {
			anchor: { path: path, offset: 0 },
			focus: { path: path, offset: 0 },
		}
	},

	insertLink(editor: CustomEditor, href: string, displayText: string) {
		const updateFn = () => {
			Transforms.insertNodes(editor, { type: ElementTypes.LINK, href, children: [{ text: displayText }] });
		}

		const newLoc = EditorCommands.getLocAfterInlineInsert(editor);
		if (newLoc)
			EditorCommands.updateSelectedElem(editor, newLoc, updateFn);
	},

	// Read up: https://developer.mozilla.org/en-US/docs/Web/API/File_API/Using_files_from_web_applications
	insertImage(editor: CustomEditor, file: File, callback?: (url: string) => void) {
		const loadImageInEditor = () => {
			const url = reader.result as string;
			const updateFn = () => {
				const image: ImageElement = { type: ElementTypes.IMAGE, url, children: [{ text: '' }] };
				Transforms.insertNodes(editor, image);
			}

			// Insert the element and update the selection - file is loaded at this point
			const newLoc = EditorCommands.getLocAfterInlineInsert(editor);
			if (newLoc)
				EditorCommands.updateSelectedElem(editor, newLoc, updateFn);

			// Callback if anyone needs the data url for this file
			if (callback)
				callback(url);
		};

		const reader = new FileReader();
		reader.addEventListener('load', loadImageInEditor);
		reader.readAsDataURL(file);
	},

	insertTable(editor: CustomEditor) {
		return TableHelper.insertTable(editor)
	},

	insertTableCol(editor: CustomEditor, colNum: number) {
		return TableHelper.insertTableCol(editor, colNum);
	},

	onLastCell(editor: CustomEditor) {
		return TableHelper.onLastCell(editor);
	},

	atTableStart(editor: CustomEditor) {
		return TableHelper.atTableStart(editor);
	},

	insertTableRow(editor: CustomEditor, rowNum: number) {
		return TableHelper.insertTableRow(editor, rowNum);
	},

	updateTableCellsPos(editor: CustomEditor) {
		return TableHelper.updateTableCellsPos(editor);
	},

	recursivelySet(editor: CustomEditor, root: NodeEntry<Node>, props: Partial<Node>) {
		Transforms.setNodes(editor, props, { at: root[1] });

		for (const [, descPath] of Array.from(Node.descendants(root[0])))
			Transforms.setNodes(editor, props, { at: [...root[1], ...descPath] });
	},

	insertParagraph(editor: CustomEditor, path: Path) {
		const updateFn = () => {
			Transforms.insertNodes(editor,
				{ type: 'paragraph', children: [{ text: '' }] },
				{ at: path }
			);
		};
		const newSel = {
			focus: { path: [...path, 0], offset: 0 },
			anchor: { path: [...path, 0], offset: 0}
		};
		EditorCommands.updateSelectedElem(editor, newSel, updateFn);
	},

	// Check if the last element is an element of given type
	onElemType(editor: CustomEditor, types: string[]) {
		const matches = Array.from(Editor.nodes(editor, {
			match: (n) => SlateElement.isElement(n) && types.includes(n.type),
		}));
		return matches.length > 0;
	},

	// Gets the last element of that type
	// Assumes you've already checked if onElemType
	getElemType(editor: CustomEditor, type: string) {
		const matches = Array.from(Editor.nodes(editor, {
			match: (n) => SlateElement.isElement(n) && n.type === type,
		}));

		const node = matches[matches.length - 1];
		return node;
	},

	// Returns true if the given mark is active on the selected text
	isMarkActive(editor: CustomEditor, mark: string) {
		const marks: any = Editor.marks(editor);
		return marks ? marks[mark] === true : false;
	},

	// Toggles the given mark on/off
	toggleMark(editor: CustomEditor, mark: string) {
		const isActive = EditorCommands.isMarkActive(editor, mark);

		if (isActive)
			Editor.removeMark(editor, mark);
		else
			Editor.addMark(editor, mark, true);
	},

	// Returns true if the block type is active
	isBlockActive(editor: CustomEditor, block: string) {
		const match = Array.from(Editor.nodes(editor, {
			match: (n: any) => n.type === block,
		}));

		return !!match.length;
	},

	// Toggle the block on/off, 'paragraph' is the default block type
	// Elements are a type of Node that contian more Elements or Text Nodes
	toggleBlock(editor: CustomEditor, block: string) {
		// Unwrap list elements, set them to 'list-item' type, then wrap them inside the list item type
		const isActive = EditorCommands.isBlockActive(editor, block);

		if (!isListType(block)) {
			// In case the nodes are already wrapped in a <ul> or <ol> or <code>
			EditorCommands.unwrapNodes(editor)

			Transforms.setNodes(
				editor,
				{ type: isActive ? 'paragraph' : block },
				{ match: n => Editor.isBlock(editor, n) }
			);
			return;
		}

		if (!isActive) {
			// Remove the current block type(Ex: paragraph) the nodes are in, if its a listItem
			EditorCommands.unwrapNodes(editor);

			// Set their type to listItem
			Transforms.setNodes<SlateElement>(editor, { type: 'listItem' });

			// Wrap them inside the given list type
			Transforms.wrapNodes(editor, { type: block, children: [] });
		} else {
			// Set their type back to paragraph
			Transforms.setNodes<SlateElement>(editor, { type: 'paragraph' });

			// Remove the <ol> or <ul> type that was wrapping them
			EditorCommands.unwrapNodes(editor);
		}
	},

	unwrapNodes(editor: CustomEditor) {
		// Unwraps lists
		Transforms.unwrapNodes(editor, {
			match: n => (!Editor.isEditor(n) && SlateElement.isElement(n) && isListType(n.type)),
			split: true,
		});
	},

	// If nested list, will be unnested by 1 level
	// If not a nested list, will become a paragraph
	unindentList(editor: CustomEditor) {
		const nodeEntry = EditorCommands.getElemType(editor, "listItem");
		if (nodeEntry) {
			const [editorNode] = Editor.node(editor, []);
			const [, listItemNodePath] = nodeEntry;

			// nestedLevel=1 is an unindented listItem
			let nestedLevel = 0;
			const ancestors = Array.from(Node.ancestors(editorNode, listItemNodePath));
			ancestors.forEach(nodeEntry => {
				const node = nodeEntry[0];
				if (SlateElement.isElement(node) && ["orderedList", "unorderedList"].includes(node.type))
					nestedLevel++;
			});

			if (nestedLevel > 1) {
				Transforms.unwrapNodes(editor, {at: listItemNodePath.slice(0, -1)});
			} else {
				// Move listItem outside of this list and make it a paragraph
				listItemNodePath.pop();
				listItemNodePath[listItemNodePath.length-1]++;
				Transforms.moveNodes(editor, { to: listItemNodePath });
				Transforms.setNodes(editor, {type: 'paragraph'});
			}
		}
	},
};

export default EditorCommands;