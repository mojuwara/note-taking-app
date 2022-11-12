import { v4 as uuidv4 } from 'uuid';
import { FileSep, DefaultFileContent } from "./Constants";
import { Folder, File, CustomElement, CustomText, FileSelection } from "./Types";


export const getFirstFile = (f: File[]): string => (f.length) ? f[0].name : "";

// Get the plain text in given block element
export const getElemText = (element: CustomElement | CustomText): string => {
	if ("text" in element)
		return element["text"];

	if ("children" in element)
		return element.children.map((child: any) => getElemText(child)).join("");

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
		const time = new Date();
		const newPath = "Unfiled Notes";
		const [success, newDir] = createNewFolder(dir, selection, newPath);
		newDir[0].items.push({
			id: uuidv4(),
			name: newFileName,
			contents: DefaultFileContent,
			createTime: time,
			openedTime: time,
			modifiedTime: time,
		});
		return (success) ? [true, newDir, {folder: newPath, file: newFileName}] : [false, dir, selection];
	}

	const dirToModify = dir.filter(d => d.name === selection.folder)[0];
	if ((!dirToModify) || (!isUniqueName(dirToModify.items, newFileName)))
		return [false, dir, selection];

	const time = new Date();
	dirToModify.items.push({
		id: uuidv4(),
		name: newFileName,
		contents: DefaultFileContent,
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