// This example is for an Editor with `ReactEditor` and `HistoryEditor`
import { BaseEditor } from 'slate'
import { ReactEditor } from 'slate-react'
import { HistoryEditor } from 'slate-history'

// TODO: Is this the proper way? Or made a .d.ts file?
// Custom types for Slate
export type CustomText = { text: string; bold?: boolean, italic?: boolean, underline?: boolean }

export type GenericElement = { type: string, children: CustomText[] }
export type CodeElement = { type: 'code'; children: CustomText[] }
export type ParagraphElement = { type: 'paragraph'; children: CustomText[] }
export type CustomElement = GenericElement | ParagraphElement | CodeElement;

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
	files: File[];
}

export type File = {
	id: number;
	name: string;
	contents: CustomElement[]
}
