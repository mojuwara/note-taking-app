// This example is for an Editor with `ReactEditor` and `HistoryEditor`
import { BaseEditor } from 'slate'
import { ReactEditor } from 'slate-react'
import { HistoryEditor } from 'slate-history'

// TODO: Is this the proper way? Or make a .d.ts file?
// Custom types for Slate
export type CustomText = { text: string; bold?: boolean, italic?: boolean, underline?: boolean }

export type GenericElement = { type: string, children: CustomText[] }
export type CodeElement = { type: 'code'; children: CustomText[] }
export type ParagraphElement = { type: 'paragraph'; children: CustomText[] }
export type LinkElement = { type: 'link'; href: string, children: CustomText[] }
export type H1Element = { type: 'h1'; children: CustomText[] }
export type H2Element = { type: 'h2'; children: CustomText[] }
export type H3Element = { type: 'h3'; children: CustomText[] }
export type ImageElement = { type: 'image', url: string, children: CustomText[] }
export type CursorElement = { type: 'cursor', children: CustomText[] };

export type TableDataElement = { type: 'table-data', children: CustomText[] };
export type TableHeaderElement = { type: 'table-header', children: CustomText[] };
export type TableRowElement = { type: 'table-row', children: TableHeaderElement[] | TableDataElement[]  };
export type TableBodyElement = { type: 'table-body', children: TableRowElement[] };
export type TableHeadElement = { type: 'table-head', children: TableRowElement[] };
export type TableElement = { type: 'table', children: (TableHeadElement | TableBodyElement)[] };

export type ContainerElement = {type: 'container', children: (CustomElement | CustomText)[] }

export type CustomElement = GenericElement
	| ParagraphElement
	| ContainerElement
	| CursorElement
	| ImageElement
	| TableElement
	| CodeElement
	| LinkElement
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
	id: number;
	name: string;
	items: File[];
}

export type File = {
	id: number;
	name: string;
	contents: CustomElement[]
}

export type FileSelection = {
	file: string;
	folder: string;
}