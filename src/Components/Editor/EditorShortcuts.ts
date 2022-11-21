import { CustomEditor, ElementTypes } from '../../Types';
import EditorCommands from './EditorCommands';
import { Editor, Element as SlateElement, Transforms, Node } from 'slate';
import { focusOnEditor } from '../../Utils';

// Triggers before any change to the editor, selection will be one step behind if arrow pressed
const EditorShortcuts = (editor: CustomEditor, event: React.KeyboardEvent<HTMLDivElement>) => {
	const shiftKey = event.shiftKey;
	const ctrlKey = event.ctrlKey || event.metaKey;	// metaKey is Cmd key on Mac

	let ancestorTypes: Set<string> = new Set<string>();
	const currPath = editor.selection?.focus.path;
	if (currPath) {
		const [editorNode] = Editor.node(editor, []);
		for (const nodeEntry of Array.from(Node.ancestors(editorNode, currPath))) {
			if (SlateElement.isElement(nodeEntry[0]))
				ancestorTypes.add(nodeEntry[0].type);
		}
	}

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

	if (event.key === 'Enter' && ancestorTypes.has(ElementTypes.TABLE)) {
		event.preventDefault();

		const [tableNode, tablePath] = EditorCommands.getElemType(editor, ElementTypes.TABLE);
		if (!SlateElement.isElement(tableNode) || tableNode.type !== 'table')
			return;

		// Add new row below if 'Enter' is pressed on the last cell
		if (tableNode.selectedPos && EditorCommands.onLastCell(editor))
			EditorCommands.insertTableRow(editor, tableNode.selectedPos[0] + 1);

		// Add new para. if beginning of first cell in table is selected and 'Enter' is pressed.
		if (tableNode.selectedPos && EditorCommands.atTableStart(editor))
			EditorCommands.insertParagraph(editor, tablePath);
	}

	// convert paragraph to ordered or unordered list
	if (event.key === ' ' && ancestorTypes.has(ElementTypes.PARAGRAPH)) {
		// Right before need space is added
		const [paragraphNode] = EditorCommands.getElemType(editor, ElementTypes.PARAGRAPH);
		if (!("children" in paragraphNode && paragraphNode.children.length))
			return;

		// '* ' => Unordered list
		if (editor.selection?.focus.offset === 1
			&& "text" in paragraphNode.children[0]
			&& paragraphNode.children[0].text.startsWith("*")
			&& !EditorCommands.isBlockActive(editor, "unorderedList")) {
				event.preventDefault();
				Transforms.delete(editor, {reverse: true, distance: 1, unit: 'character'});
				EditorCommands.toggleBlock(editor, "unorderedList");
		}

		// '1. ' => Ordered list
		if (editor.selection?.focus.offset === 2
			&& "text" in paragraphNode.children[0]
			&& new RegExp(/[0-9]\.(.*)/).test(paragraphNode.children[0].text)
			&& !EditorCommands.isBlockActive(editor, "orderedList")) {
			event.preventDefault();
			Transforms.delete(editor, { reverse: true, distance: 2, unit: 'character' });
			EditorCommands.toggleBlock(editor, "orderedList");
		}
	}

	// Backspace on empty ordered/unordered list turns it into a paragraph
	if (event.key === 'Backspace' && ancestorTypes.has("listItem")) {
		const [node] = EditorCommands.getElemType(editor, "listItem");
		if (node && SlateElement.isElement(node) && Editor.isEmpty(editor, node))
			EditorCommands.toggleBlock(editor, ancestorTypes.has("orderedList") ? "orderedList" : "unorderedList");
	}

	if (event.key === 'Tab' && !shiftKey) {
		event.preventDefault();

		// If on a list, indent
		if (ancestorTypes.has("listItem") && editor.selection?.focus.offset === 0) {
			const listType = (ancestorTypes.has("orderedList")) ? "orderedList" : "unorderedList";
			const [, listItemNodePath] = EditorCommands.getElemType(editor, "listItem");
			Transforms.wrapNodes(editor, {type: listType, children: []}, {at: listItemNodePath});
			return;
		}

		Transforms.insertText(editor, '    ');
	}

	// If offset=0 and in nested list, unwrap
	// If offset=0 and not in nested list, toggle list off
	if ((event.key === 'Enter') && editor.selection?.focus.offset === 0 && ancestorTypes.has("listItem")) {
		event.preventDefault();
		EditorCommands.unindentList(editor);
		focusOnEditor();
	}

	if (shiftKey && event.key === 'Tab' && ancestorTypes.has("listItem")) {
		event.preventDefault();
		EditorCommands.unindentList(editor);
		focusOnEditor();
	}

	if (ctrlKey && event.key === 'v') {

	}

	// Shift + Tab should unwrap list
	// console.log(event.key)
}

export default EditorShortcuts;