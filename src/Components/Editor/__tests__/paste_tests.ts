import assert from 'assert';
import { createEditor, Descendant, Range } from 'slate';
import { ElementTypes } from '../../../Types';
import { withHtml } from '../EditorPlugins';

// TODO: slatejs docs use slate-hyperscript but I'm unable to get it working
let editor = withHtml(createEditor());

const removeTags = (s: string) => s.replaceAll(/<[/]*[|b|i|u|p|h1|h2|h3]>/g, "");

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

test('pasting h1', () => {
	const s = "<h1>should be header 1</h1>";
	const sClean = "should be header 1";
	const data = new DataTransfer();
	data.setData('text/html', s);
	editor.insertData(data);

	let expectedSel: Range = {
		anchor: { path: [0, 0], offset: sClean.length },
		focus: { path: [0, 0], offset: sClean.length }
	}

	let expectedChld: Descendant[] = [{
		type: ElementTypes.H1,
		children: [{ text: sClean }]
	}];

	assert.deepEqual(editor.children, expectedChld);
	assert.deepEqual(editor.selection, expectedSel);
});

test('pasting h2', () => {
	const s = "<h2>should be header 2</h2>";
	const sClean = "should be header 2";
	const data = new DataTransfer();
	data.setData('text/html', s);
	editor.insertData(data);

	let expectedSel: Range = {
		anchor: { path: [0, 0], offset: sClean.length },
		focus: { path: [0, 0], offset: sClean.length }
	}

	let expectedChld: Descendant[] = [{
		type: ElementTypes.H2,
		children: [{ text: sClean }]
	}];

	assert.deepEqual(editor.children, expectedChld);
	assert.deepEqual(editor.selection, expectedSel);
});

test('pasting h3', () => {
	const s = "<h3>should be header 3</h3>";
	const sClean = 'should be header 3';
	const data = new DataTransfer();
	data.setData('text/html', s);
	editor.insertData(data);

	let expectedSel: Range = {
		anchor: { path: [0, 0], offset: sClean.length },
		focus: { path: [0, 0], offset: sClean.length }
	}

	let expectedChld: Descendant[] = [{
		type: ElementTypes.H3,
		children: [{ text: sClean }]
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
	const list = '<ul>'
		+ '<li>first item</li>'
		+ '<li>second item</li>'
		+ '<li>third item</li>'
		+ '</ul>';

	const data = new DataTransfer();
	data.setData('text/html', list);
	editor.insertData(data);

	let expectedSel: Range = {
		anchor: { path: [0, 2, 0], offset: 10 },
		focus: { path: [0, 2, 0], offset: 10 }
	}

	let expectedChld: Descendant[] = [{
		type: ElementTypes.LIST_UNORDERED,
		children: [
			{ type: ElementTypes.LIST_ITEM, children: [{ text: 'first item' }] },
			{ type: ElementTypes.LIST_ITEM, children: [{ text: 'second item' }] },
			{ type: ElementTypes.LIST_ITEM, children: [{ text: 'third item' }] },
		]
	}];

	assert.deepEqual(editor.children, expectedChld);
	assert.deepEqual(editor.selection, expectedSel);
});

test('pasting ordered lists', () => {
	const list = '<ol>'
		+ '<li>first item</li>'
		+ '<li>second item</li>'
		+ '<li>third item</li>'
		+ '</ol>';

	const data = new DataTransfer();
	data.setData('text/html', list);
	editor.insertData(data);

	let expectedSel: Range = {
		anchor: { path: [0, 2, 0], offset: 10 },
		focus: { path: [0, 2, 0], offset: 10 }
	}

	let expectedChld: Descendant[] = [{
		type: ElementTypes.LIST_ORDERED,
		children: [
			{ type: ElementTypes.LIST_ITEM, children: [{ text: 'first item' }] },
			{ type: ElementTypes.LIST_ITEM, children: [{ text: 'second item' }] },
			{ type: ElementTypes.LIST_ITEM, children: [{ text: 'third item' }] },
		]
	}];

	assert.deepEqual(editor.children, expectedChld);
	assert.deepEqual(editor.selection, expectedSel);
});

test('pasting tables', () => {
	const table = `
		<table>
			<thead>
				<tr>
					<th>0,0</th>
					<th>0,1</th>
				</tr>
			</thead>
			<tbody>
				<tr>
					<td>1,0</td>
					<td>1,1</td>
				</tr>
			</tbody>
		</table>`;

	const data = new DataTransfer();
	data.setData('text/html', table);
	editor.insertData(data);

	let expectedSel: Range = {
		anchor: { path: [0, 1, 0, 1, 0], offset: 3 },
		focus: { path: [0, 1, 0, 1, 0], offset: 3 }
	}

	const selectedPos: [number, number] = [1, 1];
	let expectedChld: Descendant[] = [{
		type: ElementTypes.TABLE,
		selectedPos,
		children: [
			{
				type: ElementTypes.TABLE_HEAD, selectedPos, children:
				[
					{ type: ElementTypes.TABLE_ROW, selectedPos, children:
						[
							{ type: ElementTypes.TABLE_HEADER, pos: [0, 0], selectedPos, children: [{selectedPos, text: '0,0'}] },
							{ type: ElementTypes.TABLE_HEADER, pos: [0, 1], selectedPos, children: [{selectedPos, text: '0,1'}] }
						]
					}
				]
			},
			{
				type: ElementTypes.TABLE_BODY, selectedPos, children:
					[
						{
							type: ElementTypes.TABLE_ROW, selectedPos, children:
								[
									{ type: ElementTypes.TABLE_DATA, pos: [1, 0], selectedPos, children: [{ selectedPos, text: '1,0' }] },
									{ type: ElementTypes.TABLE_DATA, pos: [1, 1], selectedPos, children: [{ selectedPos, text: '1,1' }] }
								]
						}
					]
			}
		]
	}];

	assert.deepEqual(editor.children, expectedChld);
	assert.deepEqual(editor.selection, expectedSel);
});

test('pasting images', () => {
	const url = "/logo192.png";
	const img = `<img src="${url}" alt="React Logo" />`;

	const data = new DataTransfer();
	data.setData('text/html', img);
	editor.insertData(data);

	let expectedSel: Range = {
		anchor: { path: [0, 2], offset: 0 },
		focus: { path: [0, 2], offset: 0 }
	}

	let expectedChld: Descendant[] = [{
		type: ElementTypes.PARAGRAPH,
		children: [
			{ text: '' },
			{ type: ElementTypes.IMAGE, url, children: [{ text: '' }] },
			{ text: '' },
		]
	}];

	assert.deepEqual(editor.children, expectedChld);
	assert.deepEqual(editor.selection, expectedSel);
});