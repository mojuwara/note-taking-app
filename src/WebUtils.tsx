import { host } from "./Constants";
import axios from 'axios';

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
