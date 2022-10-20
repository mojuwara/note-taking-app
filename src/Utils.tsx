import { Folder, File, CustomElement, CustomText } from "./Types";
import { FileSep, host, DefaultFileContent } from "./Constants";

import axios from "axios";

export const getFirstFolder = (data: Folder[]) => {
	if (!data.length)
		return "";

	return data[0].name;
}

export const getMaxId = (entries: (Folder | File)[]) => {
	let max = -1;
	entries.forEach(f => {
		if (f.id > max)
			max = f.id;
	})
	return max;
}

// API call to create a new folder
export const postNewFolder = async (folderName: string) => {
	try {
		await axios.post(`http://${host}/folders`, { folder_name: folderName });
	} catch (error) {
		console.error("Error while creating new file:", error)
	}
}

// API call to create a new file
export const postNewFile = async (folderName: string, fileName: string) => {
	try {
		await axios.post(`http://${host}/file`, { folder_name: folderName, file_name: fileName });
	} catch (error) {
		console.error("Error while creating new file:", error)
	}
}

// Send file contents to server
export const saveFileContents = async (filePath: string, contents: string) => {
	try {
		const headers = { Accept: "application/json" };
		const { data } = await axios.put<any>(`http://${host}/file_contents`, { file_path: filePath, contents: contents }, { headers: headers });
		return data;
	} catch (error) {
		console.error(error);
		return []
	}
}

// Get the plain text in given block element
export const getElemText = (element: CustomElement | CustomText): string => {
	if ("text" in element)
		return element["text"];

	return element.children.map((child: any) => getElemText(child)).join("");
}

export const getTransitionElemClass = (open: boolean) => `${"transition-elem" + (open ? " drawer-open" : "")}`;

export const isUniqueFile = (items: File[], name: string): boolean => {
	const matches = items.filter(item => item.name === name);
	return matches.length === 0;
}

export const isUniqueFolder = (items: Folder[], name: string): boolean => {
	const matches = items.filter(item => item.name === name);
	return matches.length === 0;
}

export const isUniqueName = (items: (Folder | File)[], name: string): boolean => {
	const matches = items.filter(item => item.name === name);
	return matches.length === 0;
}

// Locate directory to add new folder to
export const findFolder = (dir: Folder[], path: string): Folder | null => {
	let dirToModify = dir;
	const pathParts = path.split(FileSep);
	for (let i = 0; i < pathParts.length - 1; i++) {
		dirToModify = dirToModify.filter(f => f.name === pathParts[i]);
	}

	return (dirToModify.length) ? dirToModify[0] : null;
}

export const getDirFromFilePath = (path: string): string => {
	const parts = path.split(FileSep);
	parts.pop();
	return parts.join(FileSep);
}

// Returns [true, updatedDir] if success, returns [false, originalDir] if failure
export const createNewFolder = (dir: Folder[], selectedPath: string, newFolderName: string): [boolean, Folder[]] => {
	// postNewFolder(folderName);
	if (!dir.length || !selectedPath) {
		if (isUniqueName(dir, newFolderName)) {
			dir.push({ id: 0, name: newFolderName, items: [] });
			return [true, dir];
		} else {
			return [false, dir];
		}
	}

	// Update the directory's items with new path
	const dirToModify = findFolder(dir, selectedPath);
	if ((dirToModify === null) || (!isUniqueName(dirToModify.items, newFolderName)))
		return [false, dir];

	dirToModify.items.push({
		id: getMaxId(dirToModify.items) + 1,	// TODO: getMaxID of subfolder
		name: newFolderName,
		items: [],
	});
	return [true, dir];
}

// Have server create new file, make local changes for user
export const createNewFile = (dir: Folder[], selectedPath: string, newFileName: string): [boolean, Folder[], string] => {
	// 'Unfiled Notes' directory if no folder exists
	if (!dir.length) {
		const newPath = "Unfiled Notes";
		const [success, newDir] = createNewFolder(dir, selectedPath, newPath);
		newDir[0].items.push({id: 0, name: newFileName, contents: DefaultFileContent});
		return (success) ? [true, newDir, `${newPath}${FileSep}${newFileName}`] : [false, dir, selectedPath];
	}

	// postNewFile(folderName, pathParts.join("/"));

	// TODO: Check for unique file names
	const folderPath = (selectedPath) ? getDirFromFilePath(selectedPath) : dir[0].name;
	const dirToModify = findFolder(dir, folderPath);
	if ((dirToModify === null) || (!isUniqueName(dirToModify.items, newFileName)))
		return [false, dir, selectedPath];

	dirToModify.items.push({
		id: getMaxId(dirToModify.items) + 1,	// TODO: getMaxID of subfolder
		name: newFileName,
		contents: DefaultFileContent,
	});

	const newPath = `${folderPath}${FileSep}${newFileName}`;
	localStorage.setItem(newPath, JSON.stringify(DefaultFileContent));
	return [true, dir, newPath];
}

export const isSubDir = (dir: string, subDir: string): boolean => {
	const dirParts = dir.split(FileSep);
	const subDirParts = subDir.split(FileSep);

	if (subDirParts.length > dirParts.length)
		return false;

	for (let i = 0; i < subDirParts.length; i++) {
		if (subDirParts[i] !== dirParts[i])
			return false;
	}

	return true;
}

// "" => 0, "X" => 0, "X/Y" => 1, "X/Y/Z" => 2
export const getItemLevel = (dir: string): number => {
	if (!dir)
		return 0;

	return dir.split(FileSep).length - 1;
}