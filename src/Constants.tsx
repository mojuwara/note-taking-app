import { ElementTypes } from "./Types";

export const host = "127.0.0.1:5000";

export const FileSep = "/"; // Single backslash

export const DefaultFileContent = [
	{ type: ElementTypes.PARAGRAPH, children: [{ text: "" }] }
];

export const DrawerWidth = 240;

export enum StorageKeys {
	Dir = "directory",				// Folder structure
	Selection = "selection"		// Currentl selected file
}