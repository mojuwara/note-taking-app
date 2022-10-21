import { Folder, File, CustomElement, CustomText, FileSelection } from "./Types";
import { FileSep, DefaultFileContent } from "./Constants";

export const getFirstFile = (f: File[]): string => (f.length) ? f[0].name : "";

export const getMaxId = (entries: (Folder | File)[]) => {
	let max = -1;
	entries.forEach(f => {
		if (f.id > max)
			max = f.id;
	})
	return max;
}

// Get the plain text in given block element
export const getElemText = (element: CustomElement | CustomText): string => {
	if ("text" in element)
		return element["text"];

	return element.children.map((child: any) => getElemText(child)).join("");
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
		const [success, newDir] = createNewFolder(dir, selection, newPath);
		newDir[0].items.push({id: 0, name: newFileName, contents: DefaultFileContent});
		return (success) ? [true, newDir, {folder: newPath, file: newFileName}] : [false, dir, selection];
	}

	const dirToModify = dir.filter(d => d.name === selection.folder)[0];
	if ((!dirToModify) || (!isUniqueName(dirToModify.items, newFileName)))
		return [false, dir, selection];

	dirToModify.items.push({
		id: getMaxId(dirToModify.items) + 1,	// TODO: getMaxID of subfolder
		name: newFileName,
		contents: DefaultFileContent,
	});

	const newPath = `${selection.folder}${FileSep}${newFileName}`;
	localStorage.setItem(newPath, JSON.stringify(DefaultFileContent));
	return [true, dir, {folder: selection.folder, file: newFileName}];
}

export const createNewFolder = (dir: Folder[], selection: FileSelection, newFolderName: string): [boolean, Folder[]] => {
	if (!isUniqueName(dir, newFolderName))
		return [false, dir];

	dir.push({ id: 0, name: newFolderName, items: [] });
	return [true, dir];
}
