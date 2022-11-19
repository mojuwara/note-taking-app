import assert from 'assert';
import { createEditor, Descendant, Range } from 'slate';
import { ElementTypes } from '../../../Types';
import { withHtml } from '../EditorPlugins';

// TODO: slatejs docs use slate-hyperscript but I'm unable to get it working
let editor = withHtml(createEditor());

const removeTags = (s: string) => s.replaceAll(/<[/]*[|b|i|u|p]>/g, "");

class DataTransfer {
	store: Map<string, string>;
	dropEffect: "move";
	effectAllowed: "move";
	files: FileList;
	items: any;
	types: readonly string[];
	constructor() {
		this.store = new Map<string, string>();
		this.dropEffect = "move";
		this.effectAllowed = "move";
		this.files = FileList.prototype;
		this.items = undefined;
		this.types = [];
	}

	setData(key: string, val: string) {
		this.store.set(key, val);
	}

	getData(key: string): string {
		return this.store.get(key) || "placeholder";
	}

	clearData(format?: string | undefined) {}
	setDragImage(image: Element, x: number, y: number) {}
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

test('pasting text', () => {
	const s = "should be text in a paragraph";
	const data = new DataTransfer();
	data.setData('text/html', s);
	editor.insertData(data);

	let expectedSel: Range = {
		anchor: { path: [0, 0], offset: s.length },
		focus: { path: [0, 0], offset: s.length }
	}

	let expectedChld: Descendant[] = [{
		type: ElementTypes.PARAGRAPH,
		children: [{ text: s }]
	}];

	assert.deepEqual(editor.children, expectedChld);
	assert.deepEqual(editor.selection, expectedSel);
});

test('pasting text with formatting', () => {
	const bold = "<b>This text is bold</b>";
	const italic = "<i>This text is italic</i>";
	const underline = "<u>This text is underlined</u>";
	const all = "<u><i><b>Underlined, bolded and italicized</b></i></u>";

	const data = new DataTransfer();
	data.setData('text/html', bold + italic + underline + all);
	editor.insertData(data);

	let expectedSel: Range = {
		anchor: { path: [0, 3], offset: removeTags(all).length},	// -21 to account got tags, Ex: '<b>'
		focus: { path: [0, 3], offset: removeTags(all).length  }
	}

	let expectedChld: Descendant[] = [{
		type: ElementTypes.PARAGRAPH,
		children: [
			{ text: removeTags(bold), bold: true },
			{ text: removeTags(italic), italic: true },
			{ text: removeTags(underline), underline: true },
			{ text: removeTags(all), underline: true, italic: true, bold: true },
		]
	}];

	assert.deepEqual(editor.children, expectedChld);
	assert.deepEqual(editor.selection, expectedSel);
});

test('pasting links', () => {
	const link = '<a href="www.google.com">Google</a>';

	const data = new DataTransfer();
	data.setData('text/html', link);
	editor.insertData(data);

	let expectedSel: Range = {
		anchor: { path: [0, 2], offset: 0 },
		focus: { path: [0, 2], offset: 0 }
	}

	let expectedChld: Descendant[] = [{
		type: ElementTypes.PARAGRAPH,
		children: [
			{ text: ''},
			{ type: ElementTypes.LINK, href: 'www.google.com', children: [{text: 'Google'}]},
			{ text: '' },
		]
	}];

	assert.deepEqual(editor.children, expectedChld);
	assert.deepEqual(editor.selection, expectedSel);
});

test('pasting unordered lists', () => {

});

test('pasting ordered lists', () => {

});

test('pasting tables', () => {

});
