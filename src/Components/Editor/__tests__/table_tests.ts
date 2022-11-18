import assert from 'assert';
import React from 'react';
import { Range, createEditor, Descendant, Editor } from 'slate';
import { ElementTypes } from '../../../Types';
import EditorCommands from '../EditorCommands';
import EditorShortcuts from '../EditorShortcuts';
import { TableHelper } from '../TableHelper';

// TODO: slatejs docs use slate-hyperscript but I'm unable to get it working
let editor = createEditor();

// Can't find a way to nicely create a React.KeyboardEvent<HTMLDivElement> event
// Should be good enough for testing?
const makeKeyboardEvent = (options: KeyboardEventInit): React.KeyboardEvent<HTMLDivElement> => {
	const event = new KeyboardEvent('onkeydown', options) as unknown as React.KeyboardEvent<HTMLDivElement>;
	return event;
}

beforeEach(() => {
	editor.children = [{
		type: ElementTypes.PARAGRAPH,
		children: [{ text: "" }]
	}];

	editor.selection = {
		anchor: { path: [0, 0], offset: 0 },
		focus: { path: [0, 0], offset: 0 },
	};
});

test('2x2 table is created on table button click', () => {
	EditorCommands.insertTable(editor);

	let expectedSel: Range = {
		anchor: { path: [0, 0, 0, 0, 0], offset: 0 },
		focus: { path: [0, 0, 0, 0, 0], offset: 0 }
	}

	const selectedPos: [number, number] = [0, 0];
	let expectedChld: Descendant[] = [{
		type: ElementTypes.TABLE,
		selectedPos,
		children: [
			{
				type: ElementTypes.TABLE_HEAD,
				selectedPos,
				children: [
					{
						type: ElementTypes.TABLE_ROW,
						selectedPos,
						children: [
							{ type: ElementTypes.TABLE_HEADER, pos: [0, 0], selectedPos, children: [{ text: '', selectedPos }] },
							{ type: ElementTypes.TABLE_HEADER, pos: [0, 1], selectedPos, children: [{ text: '', selectedPos }] },
						]
					}
				]
			},
			{
				type: ElementTypes.TABLE_BODY,
				selectedPos,
				children: [
					{
						type: ElementTypes.TABLE_ROW,
						selectedPos,
						children: [
							{ type: ElementTypes.TABLE_DATA, pos: [1, 0], selectedPos, children: [{ text: '', selectedPos }] },
							{ type: ElementTypes.TABLE_DATA, pos: [1, 1], selectedPos, children: [{ text: '', selectedPos }] },
						]
					}
				]
			},
		]
	}];

	assert.deepEqual(editor.children, expectedChld);
	assert.deepEqual(editor.selection, expectedSel);
});

test('adding a new row above', () => {
	EditorCommands.insertTable(editor);

	// Insert text on bottom-left cell to track where the new row is being inserted
	editor.selection = {
		anchor: { path: [0, 1, 0, 0, 0], offset: 0 },
		focus: { path: [0, 1, 0, 0, 0], offset: 0 }
	}
	const s = "On bottom left cell";
	editor.insertText(s);

	const rowNum = 1;
	EditorCommands.insertTableRow(editor, rowNum);

	let expectedSel: Range = {
		anchor: { path: [0, 1, rowNum-1, 0, 0], offset: 0 },
		focus: { path: [0, 1, rowNum-1, 0, 0], offset: 0 }
	}

	const selectedPos: [number, number] = [rowNum, 0];
	let expectedChld: Descendant[] = [{
		type: ElementTypes.TABLE,
		selectedPos,
		children: [
			{
				type: ElementTypes.TABLE_HEAD,
				selectedPos,
				children: [
					{
						type: ElementTypes.TABLE_ROW,
						selectedPos,
						children: [
							{ type: ElementTypes.TABLE_HEADER, selectedPos, children: [{ text: '', selectedPos }], pos: [0, 0] },
							{ type: ElementTypes.TABLE_HEADER, selectedPos, children: [{ text: '', selectedPos }], pos: [0, 1] },
						]
					}
				]
			},
			{
				type: ElementTypes.TABLE_BODY,
				selectedPos,
				children: [
					{
						type: ElementTypes.TABLE_ROW,
						selectedPos,
						children: [
							{ type: ElementTypes.TABLE_DATA, selectedPos, children: [{ text: '', selectedPos }], pos: [1, 0] },
							{ type: ElementTypes.TABLE_DATA, selectedPos, children: [{ text: '', selectedPos }], pos: [1, 1] },
						]
					},
					{
						type: ElementTypes.TABLE_ROW,
						selectedPos,
						children: [
							{ type: ElementTypes.TABLE_DATA, selectedPos, children: [{ text: s, selectedPos }], pos: [2, 0] },
							{ type: ElementTypes.TABLE_DATA, selectedPos, children: [{ text: '', selectedPos }], pos: [2, 1] },
						]
					}
				]
			},
		]
	}];

	assert.deepEqual(editor.children, expectedChld);
	assert.deepEqual(editor.selection, expectedSel);
});

test('adding a new row below', () => {
	EditorCommands.insertTable(editor);

	// Insert text on bottom-left cell to track where the new row is being inserted
	editor.selection = {
		anchor: { path: [0, 1, 0, 0, 0], offset: 0 },
		focus: { path: [0, 1, 0, 0, 0], offset: 0 }
	}
	const s = "On bottom left cell";
	editor.insertText(s);

	const rowNum = 2
	EditorCommands.insertTableRow(editor, rowNum);

	// rowNum-1 since we only count and insert data rows
	let expectedSel: Range = {
		anchor: { path: [0, 1, rowNum-1, 0, 0], offset: 0 },
		focus: { path: [0, 1, rowNum-1, 0, 0], offset: 0 }
	}

	const selectedPos: [number, number] = [rowNum, 0];
	let expectedChld: Descendant[] = [{
		type: ElementTypes.TABLE,
		selectedPos,
		children: [
			{
				type: ElementTypes.TABLE_HEAD,
				selectedPos,
				children: [
					{
						type: ElementTypes.TABLE_ROW,
						selectedPos,
						children: [
							{ type: ElementTypes.TABLE_HEADER, selectedPos, children: [{ text: '', selectedPos }], pos: [0, 0] },
							{ type: ElementTypes.TABLE_HEADER, selectedPos, children: [{ text: '', selectedPos }], pos: [0, 1] },
						]
					}
				]
			},
			{
				type: ElementTypes.TABLE_BODY,
				selectedPos,
				children: [
					{
						type: ElementTypes.TABLE_ROW,
						selectedPos,
						children: [
							{ type: ElementTypes.TABLE_DATA, selectedPos, children: [{ text: s, selectedPos }], pos: [1, 0] },
							{ type: ElementTypes.TABLE_DATA, selectedPos, children: [{ text: '', selectedPos }], pos: [1, 1] },
						]
					},
					{
						type: ElementTypes.TABLE_ROW,
						selectedPos,
						children: [
							{ type: ElementTypes.TABLE_DATA, selectedPos, children: [{ text: '', selectedPos }], pos: [2, 0] },
							{ type: ElementTypes.TABLE_DATA, selectedPos, children: [{ text: '', selectedPos }], pos: [2, 1] },
						]
					}
				]
			},
		]
	}];

	assert.deepEqual(editor.children, expectedChld);
	assert.deepEqual(editor.selection, expectedSel);
});

test('adding a new col to the left', () => {
	EditorCommands.insertTable(editor);

	// Insert text on bottom-left cell to track where the new row is being inserted
	editor.selection = {
		anchor: { path: [0, 1, 0, 0, 0], offset: 0 },
		focus: { path: [0, 1, 0, 0, 0], offset: 0 }
	}
	const s = "On bottom left cell";
	editor.insertText(s);

	const colNum = 0
	EditorCommands.insertTableCol(editor, colNum);

	let expectedSel: Range = {
		anchor: { path: [0, 0, 0, colNum, 0], offset: 0 },
		focus: { path: [0, 0, 0, colNum, 0], offset: 0 }
	}

	const selectedPos: [number, number] = [0, colNum];
	let expectedChld: Descendant[] = [{
		type: ElementTypes.TABLE,
		selectedPos,
		children: [
			{
				type: ElementTypes.TABLE_HEAD,
				selectedPos,
				children: [
					{
						type: ElementTypes.TABLE_ROW,
						selectedPos,
						children: [
							{ type: ElementTypes.TABLE_HEADER, selectedPos, children: [{ text: '', selectedPos }], pos: [0, 0] },
							{ type: ElementTypes.TABLE_HEADER, selectedPos, children: [{ text: '', selectedPos }], pos: [0, 1] },
							{ type: ElementTypes.TABLE_HEADER, selectedPos, children: [{ text: '', selectedPos }], pos: [0, 2] },
						]
					}
				]
			},
			{
				type: ElementTypes.TABLE_BODY,
				selectedPos,
				children: [
					{
						type: ElementTypes.TABLE_ROW,
						selectedPos,
						children: [
							{ type: ElementTypes.TABLE_DATA, selectedPos, children: [{ text: '', selectedPos }], pos: [1, 0] },
							{ type: ElementTypes.TABLE_DATA, selectedPos, children: [{ text: s, selectedPos }], pos: [1, 1] },
							{ type: ElementTypes.TABLE_DATA, selectedPos, children: [{ text: '', selectedPos }], pos: [1, 2] },
						]
					}
				]
			},
		]
	}];

	assert.deepEqual(editor.children, expectedChld);
	assert.deepEqual(editor.selection, expectedSel);
});

test('adding a new col to the right', () => {
	EditorCommands.insertTable(editor);

	// Insert text on bottom-left cell to track where the new row is being inserted
	editor.selection = {
		anchor: { path: [0, 1, 0, 0, 0], offset: 0 },
		focus: { path: [0, 1, 0, 0, 0], offset: 0 }
	}
	const s = "On bottom left cell";
	editor.insertText(s);

	const colNum = 1
	EditorCommands.insertTableCol(editor, colNum);

	let expectedSel: Range = {
		anchor: { path: [0, 0, 0, colNum, 0], offset: 0 },
		focus: { path: [0, 0, 0, colNum, 0], offset: 0 }
	}

	const selectedPos: [number, number] = [0, colNum];
	let expectedChld: Descendant[] = [{
		type: ElementTypes.TABLE,
		selectedPos,
		children: [
			{
				type: ElementTypes.TABLE_HEAD,
				selectedPos,
				children: [
					{
						type: ElementTypes.TABLE_ROW,
						selectedPos,
						children: [
							{ type: ElementTypes.TABLE_HEADER, selectedPos, children: [{ text: '', selectedPos }], pos: [0, 0] },
							{ type: ElementTypes.TABLE_HEADER, selectedPos, children: [{ text: '', selectedPos }], pos: [0, 1] },
							{ type: ElementTypes.TABLE_HEADER, selectedPos, children: [{ text: '', selectedPos }], pos: [0, 2] },
						]
					}
				]
			},
			{
				type: ElementTypes.TABLE_BODY,
				selectedPos,
				children: [
					{
						type: ElementTypes.TABLE_ROW,
						selectedPos,
						children: [
							{ type: ElementTypes.TABLE_DATA, selectedPos, children: [{ text: s, selectedPos }], pos: [1, 0] },
							{ type: ElementTypes.TABLE_DATA, selectedPos, children: [{ text: '', selectedPos }], pos: [1, 1] },
							{ type: ElementTypes.TABLE_DATA, selectedPos, children: [{ text: '', selectedPos }], pos: [1, 2] },
						]
					}
				]
			},
		]
	}];

	assert.deepEqual(editor.children, expectedChld);
	assert.deepEqual(editor.selection, expectedSel);
});

test('new row inserted when Enter is clicked and the last cell is selected', () => {
	// Insert table and select bottom-left cell
	EditorCommands.insertTable(editor);
	editor.selection = {
		anchor: { path: [0, 1, 0, 1, 0], offset: 0 },
		focus: { path: [0, 1, 0, 1, 0], offset: 0 }
	};
	TableHelper.onTableSelected(editor, Editor.node(editor, [0, 1, 0, 1]));

	// Insert text to track where the new row is inserted
	const s = "On bottom-right cell";
	editor.insertText(s);
	// EditorCommands.updateTableSelectedCell(editor);
	EditorShortcuts(editor, makeKeyboardEvent({key: 'Enter'}));

	let expectedSel: Range = {
		anchor: { path: [0, 1, 1, 0, 0], offset: 0 },
		focus: { path: [0, 1, 1, 0, 0], offset: 0 }
	}

	const selectedPos: [number, number] = [2, 0];
	let expectedChld: Descendant[] = [{
		type: ElementTypes.TABLE,
		selectedPos,
		children: [
			{
				type: ElementTypes.TABLE_HEAD,
				selectedPos,
				children: [
					{
						type: ElementTypes.TABLE_ROW,
						selectedPos,
						children: [
							{ type: ElementTypes.TABLE_HEADER, selectedPos, children: [{ text: '', selectedPos }], pos: [0, 0] },
							{ type: ElementTypes.TABLE_HEADER, selectedPos, children: [{ text: '', selectedPos }], pos: [0, 1] },
						]
					}
				]
			},
			{
				type: ElementTypes.TABLE_BODY,
				selectedPos,
				children: [
					{
						type: ElementTypes.TABLE_ROW,
						selectedPos,
						children: [
							{ type: ElementTypes.TABLE_DATA, selectedPos, children: [{ text: '', selectedPos }], pos: [1, 0] },
							{ type: ElementTypes.TABLE_DATA, selectedPos, children: [{ text: s, selectedPos }], pos: [1, 1] },
						]
					},
					{
						type: ElementTypes.TABLE_ROW,
						selectedPos,
						children: [
							{ type: ElementTypes.TABLE_DATA, selectedPos, children: [{ text: '', selectedPos }], pos: [2, 0] },
							{ type: ElementTypes.TABLE_DATA, selectedPos, children: [{ text: '', selectedPos }], pos: [2, 1] },
						]
					}
				]
			},
		]
	}];

	assert.deepEqual(editor.children, expectedChld);
	assert.deepEqual(editor.selection, expectedSel);
});

// Also ensures selectedPos is not set on the table when the paragraph is selected
test('paragraph is inserted above if enter is clicked at very first cell', () => {
	// Insert table and select bottom-left cell
	EditorCommands.insertTable(editor);
	editor.selection = {
		anchor: { path: [0, 0, 0, 0, 0], offset: 0 },
		focus: { path: [0, 0, 0, 0, 0], offset: 0 }
	};
	EditorShortcuts(editor, makeKeyboardEvent({ key: 'Enter' }));

	let expectedSel: Range = {
		anchor: { path: [0, 0], offset: 0 },
		focus: { path: [0, 0], offset: 0 }
	}

	let expectedChld: Descendant[] = [
		{
			type: ElementTypes.PARAGRAPH,
			children: [{ text: "" }]
		},
		{
		type: ElementTypes.TABLE,
		children: [
			{
				type: ElementTypes.TABLE_HEAD,
				children: [
					{
						type: ElementTypes.TABLE_ROW,
						children: [
							{ type: ElementTypes.TABLE_HEADER, children: [{ text: ''  }], pos: [0, 0] },
							{ type: ElementTypes.TABLE_HEADER, children: [{ text: ''  }], pos: [0, 1] },
						]
					}
				]
			},
			{
				type: ElementTypes.TABLE_BODY,
				children: [{
					type: ElementTypes.TABLE_ROW,
					children: [
						{ type: ElementTypes.TABLE_DATA, children: [{ text: ''  }], pos: [1, 0] },
						{ type: ElementTypes.TABLE_DATA, children: [{ text: ''  }], pos: [1, 1] },
					]
				}]
			},
		]
	}];

	assert.deepEqual(editor.children, expectedChld);
	assert.deepEqual(editor.selection, expectedSel);
});