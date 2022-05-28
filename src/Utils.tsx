import { Folder, File, CustomElement, CustomText } from "./Types";
import { FileSep, host } from "./Constants";

import axios from "axios";

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

export const getFirstFolder = (data: Folder[]) => {
	if (!data.length)
		return "";

	return data[0].name;
}

// Get the folder name from the given path
export const getFolderName = (path: string) => {
	const [folderName] = path.split(FileSep);
	return folderName;
}

export const getMaxId = (entries: Folder[] | File[]) => {
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
		await axios.post(`http://${host}/folders`, { folderName: folderName });
	} catch (error) {
		console.error("Error while creating new file:", error)
	}
}

// API call to create a new file
export const postNewFile = async (folderName: string, fileName: string) => {
	try {
		await axios.post(`http://${host}/file`, { folderName: folderName, fileName: fileName });
	} catch (error) {
		console.error("Error while creating new file:", error)
	}
}

// Send file contents to server
export const saveFileContents = async (filePath: string, contents: string) => {
	try {
		const headers = { Accept: "application/json" };
		const { data } = await axios.put<any>(`http://${host}/file_contents`, { filePath: filePath, contents: contents }, { headers: headers });
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