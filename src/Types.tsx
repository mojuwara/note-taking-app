// This example is for an Editor with `ReactEditor` and `HistoryEditor`
import { BaseEditor } from 'slate'
import { ReactEditor } from 'slate-react'
import { HistoryEditor } from 'slate-history'

// Used as [rowNum, colNum] - zero indexed
export type Tuple<T> = [T, T];

// TODO: Is this the proper way? Or make a .d.ts file?
// Custom types for Slate
export type CustomText = {
	text: string;
	bold?: boolean,
	italic?: boolean,
	underline?: boolean,
	selectedPos?: Tuple<number> | null;
}

// Better way than adding 'pos' to Generic Element?
/**
 * Catch when elements are selected and not selected
 * When selected,
 */
export type GenericElement = {
	type								: string,
	children						: CustomText[],
	pos?								: Tuple<number>,
	selectedPos?				: Tuple<number>,
	// onSelected?					: null | ((editor: CustomEditor, entry: NodeEntry) => void),
	// onDeselected?				: null | ((editor: CustomEditor, entry: NodeEntry) => void),
}
export type ListElement = {type: 'listItem', children: CustomText[]}
export type OrderedListElement = {
	type: 'orderedList',
	children: (OrderedListElement | UnorderedListElement | ListElement)[],
};
export type UnorderedListElement = {
	type: 'unorderedList',
	children: (OrderedListElement | UnorderedListElement | ListElement)[],
};
export type CodeElement = { type: 'code', children: CustomText[] }
export type ParagraphElement = { type: 'paragraph', children: (CustomText | LinkElement | ImageElement)[] }
export type LinkElement = { type: 'link', href: string, children: CustomText[] }
export type H1Element = { type: 'h1', children: CustomText[] }
export type H2Element = { type: 'h2', children: CustomText[] }
export type H3Element = { type: 'h3', children: CustomText[] }
export type ImageElement = { type: 'image', url: string, children: CustomText[] }

export type TableDataElement = {
	type: 'table-data',
	children: CustomText[],
	pos: Tuple<number>,
	selectedPos?: Tuple<number> | null,
	// onSelected: (editor: CustomEditor, entry: NodeEntry) => void,
};
export type TableHeaderElement = {
	type: 'table-header',
	children: CustomText[],
	pos: Tuple<number>
	selectedPos?: Tuple<number> | null,
	// onSelected: (editor: CustomEditor, entry: NodeEntry) => void
};
export type TableRowElement = { type: 'table-row', children: TableHeaderElement[] | TableDataElement[], selectedPos?: Tuple<number> | null  };
export type TableBodyElement = { type: 'table-body', children: TableRowElement[], selectedPos?: Tuple<number> | null };
export type TableHeadElement = { type: 'table-head', children: TableRowElement[], selectedPos?: Tuple<number> | null };
export type TableElement = {
	type: 'table',
	children: (TableHeadElement | TableBodyElement)[],
	selectedPos?: Tuple<number> | null,
	// onDeselected: (editor: CustomEditor, entry: NodeEntry) => void,
 };
// export type TableContainerElement = {type: 'table-container', children: TableElement[] };

export type ContainerElement = {type: 'container', children: (CustomElement | CustomText)[] }

export type CustomElement = GenericElement
| UnorderedListElement
| OrderedListElement
| TableElement
| TableHeaderElement
| TableDataElement
| TableRowElement
| TableBodyElement
| TableHeadElement
| ParagraphElement
| ContainerElement
| ImageElement
| CodeElement
| LinkElement
| ListElement
| H1Element
| H2Element
| H3Element;

export type CustomEditor = BaseEditor & ReactEditor & HistoryEditor;

// Nodes => Editor, Elements(defined above) and Text nodes
declare module 'slate' {
	interface CustomTypes {
		Text: CustomText
		Editor: CustomEditor
		Element: CustomElement
	}
}

export type Folder = {
	id: string;
	name: string;
	items: File[];
}

export type File = {
	id: string;
	name: string;
	createTime: Date;
	openedTime: Date;
	modifiedTime: Date;
	contents: CustomElement[]
}

export type FileSelection = {
	file: string;
	folder: string;
}