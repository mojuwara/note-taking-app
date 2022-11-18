import assert from 'assert';
import React from 'react';
import { Range, createEditor, Descendant } from 'slate';
import { ElementTypes } from '../../../Types';
import EditorCommands from '../EditorCommands';
import EditorShortcuts from '../EditorShortcuts';

// TODO: slatejs docs use slate-hyperscript but I'm unable to get it working
let editor =createEditor();

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

test('creating unordered lists on empty line', () => {
	EditorCommands.toggleBlock(editor, ElementTypes.LIST_UNORDERED);
	let expectedSel: Range = {
		anchor: { path: [0, 0, 0], offset: 0 },
		focus: { path: [0, 0, 0], offset: 0 }
	}

	let expectedChld: Descendant[] = [{
		type: ElementTypes.LIST_UNORDERED,
		children: [{type: ElementTypes.LIST_ITEM, children:[{	text: '' }]}]
	}];

	assert.deepEqual(editor.children, expectedChld);
	assert.deepEqual(editor.selection, expectedSel);
});

test('creating unordered lists on non-empty line', () => {
	const s = "note";
	editor.insertText(s);
	EditorCommands.toggleBlock(editor, ElementTypes.LIST_UNORDERED);
	let expectedSel: Range = {
		anchor: { path: [0, 0, 0], offset: s.length },
		focus: { path: [0, 0, 0], offset: s.length }
	}

	let expectedChld: Descendant[] = [{
		type: ElementTypes.LIST_UNORDERED,
		children: [{type: ElementTypes.LIST_ITEM, children: [{ text: s }]}]
	}];

	assert.deepEqual(editor.children, expectedChld);
	assert.deepEqual(editor.selection, expectedSel);
});

test('creating unordered lists by typing "* "', () => {
	editor.insertText("*");
	EditorShortcuts(editor, makeKeyboardEvent({key: ' '}));
	let expectedSel: Range = {
		anchor: { path: [0, 0, 0], offset: 0 },
		focus: { path: [0, 0, 0], offset: 0 }
	}

	let expectedChld: Descendant[] = [{
		type: ElementTypes.LIST_UNORDERED,
		children: [{type: ElementTypes.LIST_ITEM, children: [{ text: "" }]}]
	}];

	assert.deepEqual(editor.children, expectedChld);
	assert.deepEqual(editor.selection, expectedSel);
});

test('creating unordered lists by typing "1. "', () => {
	editor.insertText("1.");
	EditorShortcuts(editor, makeKeyboardEvent({key: ' '}));
	let expectedSel: Range = {
		anchor: { path: [0, 0, 0], offset: 0 },
		focus: { path: [0, 0, 0], offset: 0 }
	}

	let expectedChld: Descendant[] = [{
		type: ElementTypes.LIST_ORDERED,
		children: [{type: ElementTypes.LIST_ITEM, children: [{ text: "" }]}]
	}];

	assert.deepEqual(editor.children, expectedChld);
	assert.deepEqual(editor.selection, expectedSel);
});

test('unindenting nested listItem', () => {
	/**
	 * <ol>
	 * 	<li>...</li>
	 * 	<ol>
	 * 		<li>...</li>
	 * 	</ol>
	 * <ol>
	 */
	const s = "Inside nested list";
	editor.children = [{
		type: ElementTypes.LIST_ORDERED,
		children: [
			{type: ElementTypes.LIST_ITEM, children: [{ text: "Top level" }]},
			{type: ElementTypes.LIST_ORDERED, children: [{ type: ElementTypes.LIST_ITEM, children: [{ text: s }]}]},
		]
	}];

	editor.selection = {
		anchor: { path: [0, 1, 0, 0], offset: s.length },
		focus: { path: [0, 1, 0, 0], offset: s.length }
	};

	/**
	 * <ol>
	 * 	<li>...</li>
	 * <ol>
	 */
	EditorShortcuts(editor, makeKeyboardEvent({ key: 'Tab', shiftKey: true}));
	const expectedChld = editor.children = [{
		type: ElementTypes.LIST_ORDERED,
		children: [
			{type: ElementTypes.LIST_ITEM, children: [{ text: "Top level" }]},
			{type: ElementTypes.LIST_ITEM, children: [{ text: s }]},
		]
	}];

	const expectedSel = {
		anchor: { path: [0, 1, 0], offset: s.length },
		focus: { path: [0, 1, 0], offset: s.length }
	};

	assert.deepEqual(editor.selection, expectedSel);
	assert.deepEqual(editor.children, expectedChld);
});

test('unindenting listItem creates paragraph', () => {
	/**
	 * <ol>
	 * 	<li>...</li>
	 * 	<li>...</li>
	 * <ol>
	 */
	const s = "Inside nested list";
	editor.children = [{
		type: ElementTypes.LIST_ORDERED,
		children: [
			{type: ElementTypes.LIST_ITEM, children: [{ text: "Top level" }]},
			{type: ElementTypes.LIST_ITEM, children: [{ text: s }]},
		]
	}];

	editor.selection = {
		anchor: { path: [0, 1, 0], offset: s.length },
		focus: { path: [0, 1, 0], offset: s.length }
	};

	/**
	 * <ol>
	 * 	<li>...</li>
	 * <ol>
	 * <p>...</p>
	 */
	EditorShortcuts(editor, makeKeyboardEvent({ key: 'Tab', shiftKey: true }));
	const expectedChld = [
		{
			type: ElementTypes.LIST_ORDERED,
			children: [{type: ElementTypes.LIST_ITEM, children: [{ text: "Top level" }]}]
		},
		{type: ElementTypes.PARAGRAPH, children: [{ text: s }]},
	];

	const expectedSel = {
		anchor: { path: [1, 0], offset: s.length },
		focus: { path: [1, 0], offset: s.length }
	};

	assert.deepEqual(editor.selection, expectedSel);
	assert.deepEqual(editor.children, expectedChld);
})

test('tab at beginning of listItem creates nested unorderedlists', () => {
	/**
	 * <ol>
	 * 	<li>...</li>
	 * 	<li>...</li>
	 * <ol>
	 */
	const s = "string";
	editor.children = [{
			type: ElementTypes.LIST_ORDERED,
			children: [
				{type: ElementTypes.LIST_ITEM, children: [{ text: "Top level" }]},
				{type: ElementTypes.LIST_ITEM, children: [{ text: s }]},
			]
		},
	];

	editor.selection = {
		anchor: { path: [0, 1, 0], offset: 0 },
		focus: { path: [0, 1, 0], offset: 0 }
	}

	/**
	 * <ol>
	 * 	<li>...</li>
	 * 	<ol>
	 * 		<li>...</li>
	 * 	</ol>
	 * <ol>
	 */
	EditorShortcuts(editor, makeKeyboardEvent({ key: 'Tab' }));
	const expectedChld = [
		{
			type: ElementTypes.LIST_ORDERED,
			children: [
				{ type: ElementTypes.LIST_ITEM, children: [{ text: "Top level" }] },
				{
					type: ElementTypes.LIST_ORDERED,
					children: [{ type: ElementTypes.LIST_ITEM, children: [{ text: s }] }]
				}
			]
		},
	];

	const expectedSel = {
		anchor: { path: [0, 1, 0, 0], offset: 0 },
		focus: { path: [0, 1, 0, 0], offset: 0 }
	};

	assert.deepEqual(editor.selection, expectedSel);
	assert.deepEqual(editor.children, expectedChld);
})
