import { Folder, File } from "./Types";
import { FileSep } from "./Constants";

// const getFirstFile = (data: Folder[]): string => {
// 	// Make sure there are folders
// 	if (!data.length)
// 		return "";

// 	// Make sure there are files in the first folder
// 	const firstFolder = data[0];
// 	if (!firstFolder.files.length)
// 		return "";

// 	const firstFile = firstFolder.files[0];
// 	return [firstFolder.name, firstFile.name].join(FileSep);
// }

export const getFirstFolder = (data: Folder[]): string => {
	// Make sure there are folders
	if (!data.length)
		return "";

	// Make sure there are files in the first folder
	return data[0].name;
}

export const getFolderName = (path: string): string => {
	const [folderName] = path.split(FileSep);
	return folderName;
}

export const getMaxId = (entries: Folder[] | File[]): number => {
	let max = -1;
	entries.forEach(f => {
		if (f.id > max)
			max = f.id;
	})
	return max;
}