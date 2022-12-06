import { BaseEditor, BaseRange } from 'slate'
import { ReactEditor } from 'slate-react'
import { HistoryEditor } from 'slate-history'

// Used as [rowNum, colNum] - zero indexed
export type Tuple<T> = [T, T];

export interface RangeDecoration extends BaseRange {
	isUncommonWord? : boolean
}

// Alphabetical order
export enum ElementTypes {
	CODE 						= "code",
	H1 							="h1",
	H2 							= "h2",
	H3 							= "h3",
	IMAGE 					= "image",
	LINK 						= "link",
	LIST_ITEM 			= "listItem",
	LIST_ORDERED 		= "orderedList",
	LIST_UNORDERED 	= "unorderedList",
	PARAGRAPH 			= "paragraph",
	TABLE 					= "table",
	TABLE_BODY 			= "table-body",
	TABLE_DATA 			= "table-data",
	TABLE_HEAD 			= "table-head",
	TABLE_HEADER 		= "table-header",
	TABLE_ROW 			= "table-row",
}

// Custom types for Slate
export type CustomText = {
	text						: string;
	bold?						: boolean,
	italic?					: boolean,
	underline?			: boolean,
	isUncommonWord?	: boolean,
	selectedPos?		: Tuple<number> | null;
}

export type GenericElement = {
	type								: string,
	children						: CustomText[],
	pos?								: Tuple<number>,
	selectedPos?				: Tuple<number>,
};

export type CodeElement = { type: ElementTypes.CODE, children: CustomText[] };

export type H1Element = { type: ElementTypes.H1, children: CustomText[] };
export type H2Element = { type: ElementTypes.H2, children: CustomText[] };
export type H3Element = { type: ElementTypes.H3, children: CustomText[] };

export type ImageElement = { type: ElementTypes.IMAGE, url: string, children: CustomText[] }

export type LinkElement = { type: ElementTypes.LINK, href: string, children: CustomText[] }

export type ListItemElement = { type: ElementTypes.LIST_ITEM, children: CustomText[] };

export type ListOrderedElement = {
	type		: ElementTypes.LIST_ORDERED,
	children: (ListOrderedElement | ListUnorderedElement | ListItemElement)[],
};

export type ListUnorderedElement = {
	type		: ElementTypes.LIST_UNORDERED,
	children: (ListOrderedElement | ListUnorderedElement | ListItemElement)[],
};

export type ParagraphElement = {
	type		: ElementTypes.PARAGRAPH,
	children: (CustomText | LinkElement | ImageElement)[]
};

// Tables copy-pasted into editor might not have the same type
export type TableElement = {
	type				: ElementTypes.TABLE,
	children		: (TableHeadElement | TableBodyElement)[],
	selectedPos?: Tuple<number> | null,
};

export type TableBodyElement = {
	type				: ElementTypes.TABLE_BODY,
	children		: TableRowElement[],
	selectedPos?: Tuple<number> | null
};

export type TableDataElement = {
	type				: ElementTypes.TABLE_DATA,
	children		: CustomText[],
	pos					: Tuple<number>,
	selectedPos?: Tuple<number> | null,
};

export type TableHeadElement = {
	type				: ElementTypes.TABLE_HEAD,
	children		: TableRowElement[],
	selectedPos?: Tuple<number> | null
};

export type TableHeaderElement = {
	type				: ElementTypes.TABLE_HEADER,
	children		: CustomText[],
	pos					: Tuple<number>
	selectedPos?: Tuple<number> | null,
};
export type TableRowElement = {
	type				: ElementTypes.TABLE_ROW,
	children		: TableHeaderElement[] | TableDataElement[],
	selectedPos?: Tuple<number> | null,
};

// Alphabetical order
export type CustomElement = GenericElement
	| CodeElement
	| H1Element
	| H2Element
	| H3Element
	| ImageElement
	| LinkElement
	| ListItemElement
	| ListOrderedElement
	| ListUnorderedElement
	| ParagraphElement
	| TableElement
	| TableBodyElement
	| TableDataElement
	| TableHeadElement
	| TableHeaderElement
	| TableRowElement;

export type CustomEditor = BaseEditor & ReactEditor & HistoryEditor;

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
}

export type FileSelection = {
	file: string;
	folder: string;
}