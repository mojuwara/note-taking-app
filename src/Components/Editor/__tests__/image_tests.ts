import assert from 'assert';
import { Range, createEditor, Descendant } from 'slate';
import { ElementTypes } from '../../../Types';
import EditorCommands from '../EditorCommands';
import { withImages } from '../EditorPlugins';

// TODO: slatejs docs use slate-hyperscript but I'm unable to get it working
let editor = withImages(createEditor());

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

// Insert an image from the 'public' folder for this repo so no network requests
test('embedded images', () => {
	const validateInsertImage = (url: string) => {
		const expectedSel: Range = {
			anchor: { path: [0, 2], offset: 0 },
			focus: { path: [0, 2], offset: 0 }
		};

		const expectedChld: Descendant[] = [{
			type: ElementTypes.PARAGRAPH,
			children: [
				{ text: "" },
				{ type: ElementTypes.IMAGE, url, children: [{ text: "" }] },
				{ text: "" }
			]
		}];

		assert.deepEqual(editor.children, expectedChld);
		assert.deepEqual(editor.selection, expectedSel);
	}

	const imagePath = ["/logo192.png"];
	const fileObj = new File(imagePath, "test_file", { type: "image/png" });
	EditorCommands.insertImage(editor, fileObj, validateInsertImage);
});
