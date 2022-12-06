import { v4 as uuidv4 } from 'uuid';
import { Storage } from'aws-amplify';
import { CommonWords, ProperlyDefinedWords } from './words';
import { FileSep, DefaultFileContent, StorageKeys } from "./Constants";
import { Folder, File, CustomElement, CustomText, FileSelection } from "./Types";

type DictionaryType = { [key: string]: string };
export const DICTIONARY: DictionaryType = getStorageItem(StorageKeys.Dictionary, {});

export const getFirstFile = (f: File[]): string => (f.length) ? f[0].name : "";

// Get the plain text in given block element
export const getElemText = (element: CustomElement | CustomText): string => {
	if ("text" in element)
		return element["text"];

	if ("children" in element)
		return element.children.map((child: CustomElement | CustomText) => getElemText(child)).join("");

	return "";
}

export const getTransitionElemClass = (open: boolean) => `${"transition-elem" + (open ? " drawer-open" : "")}`;

export const isUniqueName = (items: (Folder | File)[], name: string): boolean => {
	const matches = items.filter(item => item.name === name);
	return matches.length === 0;
}

export const getFullPath = (fs: FileSelection): string => fs.folder + FileSep + fs.file;

// Have server create new file, make local changes for user
export const createNewFile = (dir: Folder[], selection: FileSelection, newFileName: string): [boolean, Folder[], FileSelection] => {
	if (!dir.length) {
		const newPath = "Unfiled Notes";
		createNewFolder(dir, selection, newPath);
		selection.folder = newPath;
	}

	const dirToModify = dir.filter(d => d.name === selection.folder)[0];
	if ((!dirToModify) || (!isUniqueName(dirToModify.items, newFileName)))
		return [false, dir, selection];

	const time = new Date();
	dirToModify.items.push({
		id: uuidv4(),
		name: newFileName,
		createTime: time,
		openedTime: time,
		modifiedTime: time,
	});

	const newPath = `${selection.folder}${FileSep}${newFileName}`;
	localStorage.setItem(newPath, JSON.stringify(DefaultFileContent));
	return [true, dir, {folder: selection.folder, file: newFileName}];
}

export const createNewFolder = (dir: Folder[], selection: FileSelection, newFolderName: string): [boolean, Folder[]] => {
	if (!isUniqueName(dir, newFolderName))
		return [false, dir];

	dir.push({ id: uuidv4(), name: newFolderName, items: [] });
	return [true, dir];
}

export function getStorageItem<Type>(key: string, defaultVal: Type): Type {
	const val = localStorage.getItem(key);
	return (val !== null) ? JSON.parse(val) : defaultVal;
}

export const focusOnEditor = () => {
	const elem: HTMLElement | null = document.querySelector("#editorComponent");
	if (!elem)
		return;
	elem.focus();
}

// Words are properly defined if either:
// It's a word in the CommonWords set in words.ts
// All of the words in it's definition are either in the CommonWords set or themselves properly defined
export const isProperlyDefined = (word: string): boolean => {
	word = word.toLowerCase();
	if (CommonWords.has(word) || ProperlyDefinedWords.has(word))
		return true;
	if (!(word in DICTIONARY))	// Not a common word, not defined and not in dict
		return false;

	const isDefined = DICTIONARY[word].split(' ').every(isProperlyDefined);
	if (isDefined)
		ProperlyDefinedWords.add(word);
	return isDefined;
}

// Update word definition and determine if it's properly defined
export const updateWordDefinition = (word: string, def: string) => {
	word = word.toLocaleLowerCase();
	DICTIONARY[word] = def;
	ProperlyDefinedWords.delete(word);
 	isProperlyDefined(word);

	localStorage.setItem(StorageKeys.Dictionary, JSON.stringify(DICTIONARY));
}

export const getUndefinedWords = (def: string) => {
	if (def === "")
		return [];

	return def.split(' ').filter(word => !isProperlyDefined(word));
}

// TODO: Add callback to signal to the user that the file has been auto-saved
export const storeFileContent = async (fullPath: string, content: any) => {
	// Create a temporary JSON file with the contents of the file and store it in S3
	try {
		const response = await Storage.put(fullPath, content, { level: 'private', contentType: "application/json"});
		console.log("Response from saving file contents", response);
		return true
	} catch (error) {
		console.log("Error while saving file contents", error);
	}
}