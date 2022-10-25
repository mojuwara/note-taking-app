import { CustomEditor } from '../../Types';
import EditorCommands from './EditorCommands';

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
}

export default editorShortcuts;