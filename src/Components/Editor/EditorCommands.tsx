import {
	TableBodyElement,
	TableDataElement,
	TableElement,
	TableHeadElement,
	TableHeaderElement,
	TableRowElement,
	CustomEditor,
	ImageElement,
	// TableContainerElement,
} from "../../Types";

import { Editor, Transforms, Element as SlateElement, Node, NodeEntry } from 'slate'


// Truen if the element exists just to wrap other elements(Ex with <ul>: <ul><li>...</li></ul>)
export const isWrappedType = (blk: string) => ["unorderedList", "orderedList"].includes(blk);

// Helper functions we can reuse
// TODO: Split TableCommands into a separate object?
const EditorCommands = {
	insertLink(editor: CustomEditor, href: string, displayText: string) {
		Transforms.insertNodes(editor, { type: 'link', href, children: [{ text: displayText }] });

		const selectionPath = editor.selection?.focus.path.slice();
		if (!selectionPath || !selectionPath.length)
			return;

		// Move selection to the next element in this paragraph
		selectionPath.pop();
		selectionPath[selectionPath.length-1]++;
		Transforms.select(editor, {path: selectionPath, offset: 0})
	},

	// BUG: Crashes when image is the first value in a block
	insertImage(editor: CustomEditor, url: string) {
		const image: ImageElement = { type: 'image', url, children: [{ text: '' }] };
		Transforms.insertNodes(editor, image);
	},

	insertTable(editor: CustomEditor) {
		/**
		 * // Each table has at least one column and at least two rows(header + data)
		 * <div>
		* 	<table>
		* 		<thead>
		* 			<tr>
		* 				<th>Col Name</th>
		*					<th>Col Name</th>
		*	 			<tr>
		* 		</thead>
		* 		<tbody>
		* 			<tr>
		* 				<td>Row data</td>
		* 				<td>Row data</td>
		* 			</tr>
		* 		</tbody>
		* 	</table>
		*  </dvi>
		 */
		const headCell1: TableHeaderElement = { type: 'table-header', pos: [0, 0], children: [{ text: '' }] };
		const headCell2: TableHeaderElement = { type: 'table-header', pos: [0, 1], children: [{ text: '' }] };

		const headerRow: TableRowElement = { type: 'table-row', children: [headCell1, headCell2] };
		const tableHead: TableHeadElement = { type: 'table-head', children: [headerRow] };

		const bodyCell1: TableDataElement = { type: 'table-data', pos: [1, 0], children: [{ text: '' }] };
		const bodyCell2: TableDataElement = { type: 'table-data', pos: [1, 1], children: [{ text: '' }] };

		const bodyRow: TableRowElement = { type: 'table-row', children: [bodyCell1, bodyCell2] };
		const tableBody: TableBodyElement = { type: 'table-body', children: [bodyRow] };

		const table: TableElement = { type: 'table', children: [tableHead, tableBody] };
		// const container: TableContainerElement = { type: 'table-container', children: [table]};
		Transforms.insertNodes(editor, table);
	},

	addTableCol(editor: CustomEditor, colNum: number, dir: 'left' | 'right') {
		const [, path] = EditorCommands.getElemType(editor, "table");

		const rowGenerator = Editor.nodes(editor, {
			at: path,
			match: n => !Editor.isEditor(n) && SlateElement.isElement(n) && n.type === 'table-row'
		});

		let rowNum = 0;
		while (true) {
			const val = rowGenerator.next();
			if (!val?.value)
				break;

			const [, loc] = val.value;
			Transforms.insertNodes(editor,
				{
					type: (rowNum === 0) ? 'table-header' : 'table-data',
					pos: [-1, -1],
					children: [{text: ''}]
				},
				{at: [...loc, (dir === 'left') ? colNum : colNum + 1]}
			);
			rowNum++;
		}

		EditorCommands.updateTableCellsPos(editor);
	},

	onLastCell(editor: CustomEditor) {
		if (!EditorCommands.onElemType(editor, "table"))
			return false;

		const [tableNode, path] = EditorCommands.getElemType(editor, "table");
		if (!SlateElement.isElement(tableNode) || !(tableNode.type === "table") || !tableNode.selectedPos)
			return false;

		const cells = Array.from(Editor.nodes(editor, {
			at: path,
			match: n => !Editor.isEditor(n) && SlateElement.isElement(n) && n.type === 'table-data'
		}));

		const lastCell = cells.pop();

		return lastCell
			&& SlateElement.isElement(lastCell[0])
			&& lastCell[0].type === 'table-data' && lastCell[0].pos
			&& lastCell[0].pos.toString() === tableNode.selectedPos.toString();
	},

	atTableStart(editor: CustomEditor) {
		if (!EditorCommands.onElemType(editor, "table"))
			return false;

		const [tableNode] = EditorCommands.getElemType(editor, "table");
		if (!SlateElement.isElement(tableNode) || !(tableNode.type === "table") || !tableNode.selectedPos)
			return false;

		return (tableNode.selectedPos.toString() === '0,0' && editor.selection?.focus.offset === 0);
	},

	addTableRow(editor: CustomEditor, rowNum: number, dir: 'above' | 'below') {
		rowNum -= 1;	// To account for header row
		const [tableBody, loc] = EditorCommands.getElemType(editor, "table-body");
		if (!SlateElement.isElement(tableBody) || !SlateElement.isElement(tableBody.children[0]))	// For typescript
			return;

		const nCols = tableBody.children[0].children.length;
		const rowChildren: TableDataElement[] = [];
		for (let i = 0; i < nCols; i++)
			rowChildren.push({type: 'table-data', pos: [-1, -1], children: [{text: ''}]});

		Transforms.insertNodes(editor,
			{type: 'table-row', children: rowChildren},
			{ at: [...loc, (dir === 'above') ? rowNum : rowNum + 1] }
		);

		EditorCommands.updateTableCellsPos(editor);
	},

	updateTableCellsPos(editor: CustomEditor) {
		if (!EditorCommands.onElemType(editor, "table"))
			return;

		const [, loc] = EditorCommands.getElemType(editor, "table");

		const rowGenerator = Editor.nodes(editor, {
			at: loc,
			match: n => !Editor.isEditor(n) && SlateElement.isElement(n) && n.type === 'table-row'
		});

		let rowNum = 0;
		while (true) {
			const rowNode = rowGenerator.next();
			if (!rowNode?.value)
				break;

			const [, rowLoc] = rowNode.value;
			const cellGenerator = Editor.nodes(editor, {
				at: rowLoc,
				match: n => !Editor.isEditor(n) && SlateElement.isElement(n) && (n.type === 'table-data' || n.type === 'table-header')
			});

			let colNum = 0;
			while (true) {
				const cellNode = cellGenerator.next();
				if (!cellNode?.value)
					break;

				const [, cellLoc] = rowNode.value;
				Transforms.setNodes(editor, {pos: [rowNum, colNum]}, {at: [...cellLoc, colNum]});
				colNum++;
			}
			rowNum++;
		}
	},

	// TODO: Remove selectedCell when selection moves outside of table
	updateTableSelection(editor: CustomEditor) {
		if (!EditorCommands.onElemType(editor, "table") || !editor.selection?.anchor?.path)
			return;

		// Parent table
		const tableNode = Editor.nodes(editor, {
			at: editor.selection?.anchor?.path,
			match: (n) => !Editor.isEditor(n) && SlateElement.isElement(n)
		}).next().value;
		if (!tableNode)
			return;

		// Currently selected cell in table
		const selectedCellNode = Editor.nodes(editor, {
			at: editor.selection?.anchor?.path,
			match: (n) => !Editor.isEditor(n) && SlateElement.isElement(n) && (n.type === 'table-header' || n.type === 'table-data')
		}).next().value;
		if (!selectedCellNode)
			return;

		// Recursively update all child nodes to store current selected cell
		if (SlateElement.isElement(tableNode[0]) && SlateElement.isElement(selectedCellNode[0]) && (selectedCellNode[0].type === 'table-header' || selectedCellNode[0].type === 'table-data')) {
			const value = selectedCellNode[0].pos;

			Transforms.setNodes(editor, {'selectedPos': value}, { at: tableNode[1] });
			EditorCommands.recursivelySet(editor, tableNode, 'selectedPos', value);
		}
	},

	recursivelySet(editor: CustomEditor, root: NodeEntry<Node>, field: string, val: any) {
		const descendantsGen = Node.descendants(root[0]);
		while (true) {
			const nodeEntry = descendantsGen.next();
			if (!nodeEntry?.value)
				return

			const newProp: any = {};
			newProp[field] = val;

			const [node, subPath] = nodeEntry.value;	// Just the path from current 'root' node
			let fullPath = root[1].concat(subPath);
			Transforms.setNodes(editor, newProp, {at: fullPath});

			EditorCommands.recursivelySet(editor, [node, fullPath], field, val);
		}
	},

	insertParagraph(editor: CustomEditor) {
		const loc = editor.selection?.focus.path;
		if (loc) {
			Transforms.insertNodes(editor,
				{type: 'paragraph', children: [{text: ''}]},
				{at: [loc[0]]}
			);
		}
	},

	// Check if the last element is an element of given type
	onElemType(editor: CustomEditor, type: string) {
		const matches = Array.from(Editor.nodes(editor, {
			match: (n) => !Editor.isEditor(n) && SlateElement.isElement(n) && n.type === type,
		}));
		if (!matches.length)
			return false

		const node = matches[matches.length-1][0];
		return SlateElement.isElement(node) && node.type === type;
	},

	// Gets the last element of that type
	// Assumes you've already checked if onElemType
	getElemType(editor: CustomEditor, type: string) {
		const matches = Array.from(Editor.nodes(editor, {
			match: (n) => !Editor.isEditor(n) && SlateElement.isElement(n) && n.type === type,
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
		if (isWrappedType(block)) {
			if (!isActive) {
				// Remove the current block type the nodes are in, if its a listItem
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
			return;
		};

		// In case the nodes are already wrapped in a <ul> or <ol>
		EditorCommands.unwrapNodes(editor)

		Transforms.setNodes(
			editor,
			{ type: isActive ? 'paragraph' : block },
			{ match: n => Editor.isBlock(editor, n) }
		);
	},

	unwrapNodes(editor: CustomEditor) {
		// Unwraps lists
		Transforms.unwrapNodes(editor, {
			match: n => (!Editor.isEditor(n) && SlateElement.isElement(n) && isWrappedType(n.type)),
			split: true,
		});
	}
};

export default EditorCommands;