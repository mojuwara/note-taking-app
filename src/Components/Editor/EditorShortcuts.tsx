import EditorCommands from './EditorCommands';

const editorShortcuts = (editor: any, event: React.KeyboardEvent<HTMLDivElement>) => {
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
}

export default editorShortcuts;