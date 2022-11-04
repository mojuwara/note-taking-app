import { CustomEditor } from '../../Types';
import EditorCommands from './EditorCommands';
import { Element as SlateElement } from 'slate';

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

		// TODO: Update selection to first cell in new row
		if (tableNode.selectedPos && EditorCommands.onLastCell(editor))
			EditorCommands.addTableRow(editor, tableNode.selectedPos[0], 'below');

		// Add paragraph above - TODO: Move selection to new paragraph
		if (tableNode.selectedPos && EditorCommands.atTableStart(editor))
			EditorCommands.insertParagraph(editor);

	}

}

export default editorShortcuts;