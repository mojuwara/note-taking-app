import assert from 'assert';
import { Range, createEditor, Descendant } from 'slate';
import { ElementTypes } from '../../../Types';
import EditorCommands from '../EditorCommands';
import { withHtml } from '../EditorPlugins';

// TODO: slatejs docs use slate-hyperscript but I'm unable to get it working
let editor = withHtml(createEditor());

beforeEach(() => {
	editor.children = [{
		type: ElementTypes.PARAGRAPH,
		children: [{ text: "" }]
	}];

	editor.selection = {
		anchor: { path: [0, 0], offset: 0 },
		focus: { path: [0, 0], offset: 0 },
	};

	for (const mark of ["bold", "underline", "italic"])
		editor.removeMark(mark);
});

test('embedded links', () => {
	const href = "www.google.com";
	const displayText = "Google";
	EditorCommands.insertLink(editor, href, displayText);

	const expectedSel: Range = {
		anchor: { path: [0, 2], offset: 0 },
		focus: { path: [0, 2], offset: 0 }
	};

	const expectedChld: Descendant[] = [{
		type: ElementTypes.PARAGRAPH,
		children: [
			{ text: "" },
			{ type: ElementTypes.LINK, href, children: [{text: displayText}] },
			{ text: "" }
		]
	}];

	assert.deepEqual(editor.children, expectedChld);
	assert.deepEqual(editor.selection, expectedSel);
});
