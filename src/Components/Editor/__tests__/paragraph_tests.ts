import assert from 'assert';
import { Range, createEditor, Descendant } from 'slate';
import { ElementTypes } from '../../../Types';
import EditorCommands from '../EditorCommands';

let editor = createEditor();

beforeEach(() => {
	editor.children = [{
			type: ElementTypes.PARAGRAPH,
			children: [{ text: "" }]
	}];

	editor.selection = {
		anchor: {path: [0,0], offset: 0},
		focus: {path: [0,0], offset: 0},
	};

	for (const mark of ["bold", "underline", "italic"])
		editor.removeMark(mark);
});

test('marks', () => {
	let expectedSel: Range;
	let expectedChld: Descendant[];

	// Paragraph
	const s1 = "Normal";
	editor.insertText(s1);

	// Underline
	EditorCommands.toggleMark(editor, "underline");
	const s2 = "underlined";
	editor.insertText(s2);

	// Underline + bold
	EditorCommands.toggleMark(editor, "bold");
	const s3 = "underlined and bold";
	editor.insertText(s3);

	// Underline + bold + Italic
	EditorCommands.toggleMark(editor, "italic");
	const s4 = "underlined and bold and italic";
	editor.insertText(s4);

	// Normal
	EditorCommands.toggleMark(editor, "bold");
	EditorCommands.toggleMark(editor, "italic");
	EditorCommands.toggleMark(editor, "underline");
	const s5 = "normal";
	editor.insertText(s5);

	expectedSel = {
		anchor: { path: [0, 4], offset: s5.length },
		focus: { path: [0, 4], offset: s5.length }
	};

	expectedChld = [{
		type: ElementTypes.PARAGRAPH,
		children: [
			{ text: s1 },
			{ text: s2, underline: true },
			{ text: s3, underline: true, bold: true },
			{ text: s4, underline: true, bold: true, italic: true },
			{ text: s5 }
		]
	}];

	assert.deepEqual(editor.children, expectedChld);
	assert.deepEqual(editor.selection, expectedSel);
});

// test('insert text', () => {
// 	let expectedSel: Range;
// 	let expectedChld: Descendant[];

// 	// Paragraph
// 	const s1 = "Test string";
// 	editor.insertText(s1);

// 	expectedSel = {
// 		anchor: { path: [0, 0], offset: s1.length },
// 		focus: { path: [0, 0], offset: s1.length }
// 	};

// 	expectedChld = [{
// 		type: ElementTypes.PARAGRAPH,
// 		children: [{ text: s1 }]
// 	}];

// 	assert.deepEqual(editor.children, expectedChld);
// 	assert.deepEqual(editor.selection, expectedSel);
// });