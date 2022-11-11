import assert from 'assert';
import { createEditor } from 'slate';
import EditorCommands from '../EditorCommands';

// TODO: slatejs docs use slate-hyperscript but I'm unable to get it working
let editor = createEditor();

beforeEach(() => {
	editor.children = [{
		type: "paragraph",
		children: [{ text: "" }]
	}];

	editor.selection = {
		anchor: { path: [0, 0], offset: 0 },
		focus: { path: [0, 0], offset: 0 },
	};

	["bold", "underline", "italic"].forEach(mark => editor.removeMark(mark));

	["code", "orderedList", "unorderedList"].forEach(block => {
		if (EditorCommands.isBlockActive(editor, block))
			EditorCommands.toggleBlock(editor, block);
	})
});

test('blocks toggle', () => {
	// Should be active the first time, inactive the second
	for (const block of ["code", "orderedList", "unorderedList"]) {
		EditorCommands.toggleBlock(editor, block);
		assert.equal(EditorCommands.isBlockActive(editor, block), true);

		EditorCommands.toggleBlock(editor, block);
		assert.equal(EditorCommands.isBlockActive(editor, block), false);
	}
})

test('Only one block is active at a time', () => {
	// Only the block type used in the most recent call to toggleBlock() should be active
	const isOnlyActiveBlock = (block: string) => {
		for (const currBlock of ["code", "orderedList", "unorderedList"]) {
			const shouldBeActive = currBlock === block;
			assert.equal(EditorCommands.isBlockActive(editor, currBlock), shouldBeActive);
		}
	}

	EditorCommands.toggleBlock(editor, "code");
	EditorCommands.toggleBlock(editor, "orderedList");
	isOnlyActiveBlock("orderedList");

	EditorCommands.toggleBlock(editor, "unorderedList");
	isOnlyActiveBlock("unorderedList");

	EditorCommands.toggleBlock(editor, "code");
	isOnlyActiveBlock("code");
});
