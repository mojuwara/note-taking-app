import { CustomEditor } from '../../Types';
import EditorCommands from './EditorCommands';
import { Editor, Element as SlateElement, Transforms } from 'slate';

// Triggers before any change to the editor, selection will be one step behind if arrow pressed
const editorShortcuts = (editor: CustomEditor, event: React.KeyboardEvent<HTMLDivElement>) => {
	// metaKey is Cmd on Mac
	const ctrlKey = event.ctrlKey || event.metaKey;

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
		const [para] = EditorCommands.getElemType(editor, "paragraph");
		if (!("children" in para && para.children.length))
			return;

		// '* ' => Unordered list
		console.log("Text", para)
		if (editor.selection?.focus.offset === 1
			&& "text" in para.children[0]
			&& para.children[0].text.startsWith("*")
			&& !EditorCommands.isBlockActive(editor, "unorderedList")) {
				event.preventDefault();
				Transforms.delete(editor, {reverse: true, distance: 1, unit: 'character'});
				EditorCommands.toggleBlock(editor, "unorderedList");
		}

		// '1. ' => Ordered list
		if (editor.selection?.focus.offset === 2
			&& "text" in para.children[0]
			&& new RegExp(/[0-9]\.(.*)/).test(para.children[0].text)
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
}

export default editorShortcuts;