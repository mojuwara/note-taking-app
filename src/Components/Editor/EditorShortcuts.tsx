import { CustomEditor, ParagraphElement } from '../../Types';
import EditorCommands from './EditorCommands';
import { Editor, Element as SlateElement, Node, Transforms } from 'slate';

// Triggers before any change to the editor, selection will be one step behind if arrow pressed
const editorShortcuts = (editor: CustomEditor, event: React.KeyboardEvent<HTMLDivElement>) => {
	const shiftKey = event.shiftKey;
	const ctrlKey = event.ctrlKey || event.metaKey;	// metaKey is Cmd key on Mac

	if (ctrlKey && event.key === 'b') {
		event.preventDefault();
		EditorCommands.toggleMark(editor, "bold");
	}

	if (ctrlKey && event.key === 'u') {
		event.preventDefault();
		EditorCommands.toggleMark(editor, "underline");
	}

	if (ctrlKey && event.key === 'i') {
		event.preventDefault();
		EditorCommands.toggleMark(editor, "italic");
	}

	if (ctrlKey && event.key === '`') {
		event.preventDefault();
		EditorCommands.toggleBlock(editor, "code");
	}

	if (ctrlKey && event.key === '1') {
		event.preventDefault();
		EditorCommands.toggleBlock(editor, "h1");
	}

	if (ctrlKey && event.key === '2') {
		event.preventDefault();
		EditorCommands.toggleBlock(editor, "h2");
	}

	if (ctrlKey && event.key === '3') {
		event.preventDefault();
		EditorCommands.toggleBlock(editor, "h3");
	}

	if (event.key === 'Enter' && EditorCommands.onElemType(editor, "table")) {
		event.preventDefault();

		// Add new row below if 'Enter' is pressed on the last cell
		const [tableNode] = EditorCommands.getElemType(editor, "table");
		if (!tableNode || !SlateElement.isElement(tableNode) || tableNode.type !== 'table')
			return;

		// Add row below if last cell is selected. TODO: Update selection to first cell in new row
		if (tableNode.selectedPos && EditorCommands.onLastCell(editor))
			EditorCommands.addTableRow(editor, tableNode.selectedPos[0], 'below');

		// Add new para. if beginning of table is selected. TODO: Move selection to new paragraph
		if (tableNode.selectedPos && EditorCommands.atTableStart(editor))
			EditorCommands.insertParagraph(editor);
	}

	// convert paragraph to ordered or unordered list
	if (event.key === ' ' && EditorCommands.onElemType(editor, "paragraph")) {
		// Right before need space is added
		const [paraNode] = EditorCommands.getElemType(editor, "paragraph");
		if (!("children" in paraNode && paraNode.children.length))
			return;

		// '* ' => Unordered list
		if (editor.selection?.focus.offset === 1
			&& "text" in paraNode.children[0]
			&& paraNode.children[0].text.startsWith("*")
			&& !EditorCommands.isBlockActive(editor, "unorderedList")) {
				event.preventDefault();
				Transforms.delete(editor, {reverse: true, distance: 1, unit: 'character'});
				EditorCommands.toggleBlock(editor, "unorderedList");
		}

		// '1. ' => Ordered list
		if (editor.selection?.focus.offset === 2
			&& "text" in paraNode.children[0]
			&& new RegExp(/[0-9]\.(.*)/).test(paraNode.children[0].text)
			&& !EditorCommands.isBlockActive(editor, "orderedList")) {
			event.preventDefault();
			Transforms.delete(editor, { reverse: true, distance: 2, unit: 'character' });
			EditorCommands.toggleBlock(editor, "orderedList");
		}
	}

	// Backspace on empty ordered/unordered list turns it into a paragraph
	if (event.key === 'Backspace' && EditorCommands.onElemType(editor, "listItem")) {
		const [node] = EditorCommands.getElemType(editor, "listItem");
		if (node && SlateElement.isElement(node) && Editor.isEmpty(editor, node))
			EditorCommands.toggleBlock(editor, EditorCommands.onElemType(editor, "orderedList") ? "orderedList" : "unorderedList");
	}

	if (event.key === 'Tab' && !shiftKey) {
		event.preventDefault();

		// If on a list, indent
		if (EditorCommands.onElemType(editor, "listItem") && editor.selection?.focus.offset === 0) {
			const listType = (EditorCommands.onElemType(editor, "orderedList")) ? "orderedList" : "unorderedList";
			const [, listItemNodePath] = EditorCommands.getElemType(editor, "listItem");
			console.log("tab at listitem start");
			Transforms.wrapNodes(editor,
				{type: listType, children: []},
				{at: listItemNodePath}
			);
			return;
		}

		Transforms.insertText(editor, '    ');
	}

	// If offset=0 and in nested list, unwrap
	// If offset=0 and not in nested list, toggle list off
	if (((event.key === 'Enter') || (shiftKey && event.key === 'Tab'))
		&& (editor.selection?.focus.offset === 0 && EditorCommands.onElemType(editor, "listItem")))
		{

		event.preventDefault();

		const nodeEntry = EditorCommands.getElemType(editor, "listItem");
		if (nodeEntry) {
			const [editorNode] =  Editor.node(editor, []);
			const [listItemNode, listItemNodePath] = nodeEntry;

			// All ancestors, including the editor
			const ancestorGen = Node.ancestors(editorNode, listItemNodePath);

			let nestedListCount = 0;
			while (true) {
				const ancestor = ancestorGen.next();
				if (!ancestor.value)
					break;

				if (SlateElement.isElement(ancestor.value[0]) && ["orderedList", "unorderedList"].includes(ancestor.value[0].type))
					nestedListCount++;
			}

			const listType = (EditorCommands.onElemType(editor, "orderedList")) ? "orderedList" : "unorderedList";
			if (nestedListCount > 1) {
				// Move node out of it's current list and move it up one level
				const [, parentListPath] = EditorCommands.getElemType(editor, listType);
				parentListPath[parentListPath.length-1]++;

				Transforms.removeNodes(editor, {at: listItemNodePath});
				Transforms.insertNodes(editor, listItemNode, { at: parentListPath });
			} else {
				Transforms.removeNodes(editor, {at: listItemNodePath});

				listItemNodePath.pop()
				listItemNodePath[listItemNodePath.length-1]++;
				Transforms.insertNodes(editor, listItemNode, {at: listItemNodePath});
				Transforms.setNodes(editor, {type: 'paragraph'}, {at: listItemNodePath});
			}
		}
	}

	if (ctrlKey && event.key === 'v') {

	}

	// Shift + Tab should unwrap list
	console.log(event.key)
}

export default editorShortcuts;