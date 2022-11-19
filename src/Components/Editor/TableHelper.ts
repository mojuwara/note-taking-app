import {
	TableBodyElement,
	TableDataElement,
	TableElement,
	TableHeadElement,
	TableHeaderElement,
	TableRowElement,
	CustomEditor,
	ElementTypes,
} from "../../Types";

import EditorCommands from "./EditorCommands";

import { Editor, Transforms, Element as SlateElement, NodeEntry, Text } from 'slate'

export const TableHelper = {
	insertTable(editor: CustomEditor) {
		/**
		 * // Each table has at least one column and at least two rows(header + data)
		 * <div>
		* 	<table>
		* 		<thead>
		* 			<tr>
		* 				<th>Col Name</th>
		*					<th>Col Name</th>
		*	 			<tr>
		* 		</thead>
		* 		<tbody>
		* 			<tr>
		* 				<td>Row data</td>
		* 				<td>Row data</td>
		* 			</tr>
		* 		</tbody>
		* 	</table>
		*  </dvi>
		 */
		const headerCell1: TableHeaderElement = { type: ElementTypes.TABLE_HEADER, pos: [0, 0], children: [{ text: '' }]};
		const headerCell2: TableHeaderElement = { type: ElementTypes.TABLE_HEADER, pos: [0, 1], children: [{ text: '' }]};

		const headRow: TableRowElement = { type: ElementTypes.TABLE_ROW, children: [headerCell1, headerCell2] };
		const tableHead: TableHeadElement = { type: ElementTypes.TABLE_HEAD, children: [headRow] };

		const bodyCell1: TableDataElement = { type: ElementTypes.TABLE_DATA, pos: [1, 0], children: [{ text: '' }]};
		const bodyCell2: TableDataElement = { type: ElementTypes.TABLE_DATA, pos: [1, 1], children: [{ text: '' }]};

		const bodyRow: TableRowElement = { type: ElementTypes.TABLE_ROW, children: [bodyCell1, bodyCell2] };
		const tableBody: TableBodyElement = { type: ElementTypes.TABLE_BODY, children: [bodyRow] };

		const table: TableElement = {type: ElementTypes.TABLE, children: [tableHead, tableBody]};

		const [paraNode] = EditorCommands.getElemType(editor, ElementTypes.PARAGRAPH);
		const onEmptyNode = SlateElement.isElement(paraNode) && Editor.isEmpty(editor, paraNode);

		const updateFn = () => {
			if (onEmptyNode)
				Transforms.removeNodes(editor);
			Transforms.insertNodes(editor, table);
		}

		const newLoc = this.getLocAfterTblInsert(editor, onEmptyNode);
		if (newLoc)
			EditorCommands.updateEditor(editor, newLoc, updateFn);
	},

	getLocAfterTblInsert(editor: CustomEditor, onEmptyNode: boolean) {
		// Table is a block level elem, so it will always be a direct child of the editor - we just need the current block
		const path = editor.selection?.focus.path.slice(0, 1);
		if (!path)
			return;

		if (!onEmptyNode)
			path[0] += 1

		path.concat(0, 0, 0, 0);	// in table-head, table-row, table-header, text node
		return {
			anchor: { path: path.concat(0, 0, 0, 0), offset: 0 },
			focus: { path: path.concat(0, 0, 0, 0), offset: 0 }
		}
	},

	// selectTableStart(editor: CustomEditor) {
	// 	const [, tablePath] = EditorCommands.getElemType(editor, ElementTypes.TABLE);
	// 	// Transforms.select(editor, {path: tablePath.concat(0, 0, 0, 0), offset: 0 });
	// 	const newSel = {
	// 		anchor: { path: tablePath.concat(0, 0, 0, 0), offset: 0 }, // in table-head, table-row, table-header, text node
	// 		focus: { path: tablePath.concat(0, 0, 0, 0), offset: 0 }
	// 	}
	// 	EditorCommands.updateSelectedElem(editor, newSel);
	// },

	insertTableCol(editor: CustomEditor, colNum: number) {
		const [, tablePath] = EditorCommands.getElemType(editor, ElementTypes.TABLE);

		const updateFn = () => {
			const tableRows = Array.from(Editor.nodes(editor, {
				at: tablePath,
				match: n => !Editor.isEditor(n) && SlateElement.isElement(n) && n.type === 'table-row'
			}));

			for (let rowNum = 0; rowNum < tableRows.length; rowNum++) {
				const [, loc] = tableRows[rowNum];
				Transforms.insertNodes(editor,
					{
						type: (rowNum === 0) ? 'table-header' : 'table-data',
						pos: [-1, -1],
						children: [{ text: '' }]
					},
					{ at: [...loc, colNum] }
				);
			}
			TableHelper.updateTableCellsPos(editor);
		}

		// TableHelper.updateTableCellsPos(editor);
		// Transforms.select(editor, [...tablePath, 0, 0, colNum, 0]);
		// TableHelper.updateTableSelectedCell(editor);
		const newSel = {
			anchor: {path: [...tablePath, 0, 0, colNum, 0], offset: 0},
			focus: { path: [...tablePath, 0, 0, colNum, 0], offset: 0}
		}
		EditorCommands.updateEditor(editor, newSel, updateFn);
	},

	onLastCell(editor: CustomEditor) {
		if (!EditorCommands.onElemType(editor, [ElementTypes.TABLE]))
			return false;

		// Narrowing to make TypeScript happy
		const [tableNode, tableNodePath] = EditorCommands.getElemType(editor, ElementTypes.TABLE);
		if (!SlateElement.isElement(tableNode) || !(tableNode.type === ElementTypes.TABLE) || !tableNode.selectedPos)
			return false;

		const lastCell = Array.from(Editor.nodes(editor, {
			at: tableNodePath,
			match: n => SlateElement.isElement(n) && n.type === 'table-data'
		})).pop();

		// Narrowing to make TypeScript happy
		return lastCell
			&& SlateElement.isElement(lastCell[0])
			&& lastCell[0].type === 'table-data' && lastCell[0].pos && lastCell[0].selectedPos
			&& lastCell[0].pos.toString() === lastCell[0].selectedPos.toString();
	},

	atTableStart(editor: CustomEditor) {
		if (!EditorCommands.onElemType(editor, [ElementTypes.TABLE]))
			return false;

		const [tableNode] = EditorCommands.getElemType(editor, ElementTypes.TABLE);
		if (!SlateElement.isElement(tableNode) || !(tableNode.type === ElementTypes.TABLE) || !tableNode.selectedPos)
			return false;

		return (tableNode.selectedPos[0] === 0 && tableNode.selectedPos[0] === 0 && editor.selection?.focus.offset === 0);
	},

	insertTableRow(editor: CustomEditor, rowNum: number) {
		rowNum -= 1;	// Begin counting from the data row, subtract one to account for the header row at the beginning
		const [tableBody, tableBodyPath] = EditorCommands.getElemType(editor, "table-body");
		if (!SlateElement.isElement(tableBody) || !SlateElement.isElement(tableBody.children[0]))	// For typescript
			return;

		// Create table-data elements by mapping over cells in the first row
		const updateFn = () => {
			if (Text.isText(tableBody.children[0]))
				return;

			const firstDataRow = tableBody.children[0].children;
			const newDataRow: TableDataElement[] = firstDataRow.map(() => {
				return {
					type: ElementTypes.TABLE_DATA,
					pos: [-1, -1],
					children: [{ text: '' }],
				};
			});

			Transforms.insertNodes(editor,
				{ type: ElementTypes.TABLE_ROW, children: newDataRow },
				{ at: [...tableBodyPath, rowNum] }
			);
			TableHelper.updateTableCellsPos(editor);
		}

		const newSel = {
			anchor: {path: [...tableBodyPath, rowNum, 0, 0], offset: 0},
			focus: { path: [...tableBodyPath, rowNum, 0, 0], offset: 0 },
		}
		EditorCommands.updateEditor(editor, newSel, updateFn);
		// TableHelper.updateTableCellsPos(editor);
		// Transforms.select(editor, [...tableBodyPath, rowNum, 0, 0]);
		// TableHelper.updateTableSelectedCell(editor);
	},

	updateTableCellsPos(editor: CustomEditor) {
		if (!EditorCommands.onElemType(editor, [ElementTypes.TABLE]))
			return;

		const [, tablePath] = EditorCommands.getElemType(editor, ElementTypes.TABLE);
		const tableRows = Array.from(Editor.nodes(editor, {
			at: tablePath,
			match: n => SlateElement.isElement(n) && n.type === 'table-row'
		}));

		for (let rowNum = 0; rowNum < tableRows.length; rowNum++) {
			const [, rowPath] = tableRows[rowNum];
			const cells = Array.from(Editor.nodes(editor, {
					at: rowPath,
					match: n => !Editor.isEditor(n) && SlateElement.isElement(n) && (n.type === 'table-data' || n.type === 'table-header')
				}));

			for (let colNum = 0; colNum < cells.length; colNum++) {
				const [, cellPath] = cells[colNum];
				Transforms.setNodes(editor, { pos: [rowNum, colNum] }, { at: cellPath });
			}
		}
	},

	// Used to set the 'pos' field for nodes not in an editor
	updateTableCellPos2(table: TableElement) {
		let rowNum = 0;
		for (const child of table.children) {	// table-head or table-body
			for (const row of child.children) {	// table-row
				for (let colNum = 0; colNum < row.children.length; colNum++)	// table-data or table-header
					row.children[colNum].pos = [rowNum, colNum];

				console.log("On row", rowNum, row.children);
				rowNum++;
			}
		}
	},

	onTableSelected(editor: CustomEditor, nodeEntry: NodeEntry) {
		if (!EditorCommands.onElemType(editor, [ElementTypes.TABLE]) || !editor.selection?.anchor?.path || !nodeEntry)
			return;

		// Only the selected data or header type is allowed to propagate the selectedPos to its child cells
		if (!SlateElement.isElement(nodeEntry[0]) || !["table-header", "table-data"].includes(nodeEntry[0].type))
			return;

		// Recursively update all child nodes to store update selected cell
		const tableNodeEntry = EditorCommands.getElemType(editor, ElementTypes.TABLE);
		if (SlateElement.isElement(tableNodeEntry[0]) && "pos" in nodeEntry[0]) {
			const position = nodeEntry[0].pos;
			EditorCommands.recursivelySet(editor, tableNodeEntry, {'selectedPos': position});
		}
	},

	// Remove selectedPos for this table and descendents
	onTableDeselected(editor: CustomEditor, nodeEntry: NodeEntry) {
		// When the table is no longer selected, let the cells know
		if (!SlateElement.isElement(nodeEntry[0]) || nodeEntry[0].type !== ElementTypes.TABLE)
			return;
		EditorCommands.recursivelySet(editor, nodeEntry, {selectedPos: null});
	},
}