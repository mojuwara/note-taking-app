import { useState, useEffect } from 'react'

import { host } from './Constants';
import { Folder } from './Types';
import { getMaxId, getFolderName, getFirstFolder } from './Utils';

import MyEditor from './Components/Editor/Editor';
import MyToolbar from './Components/Toolbar/Toolbar';

import Box from '@mui/material/Box';

import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';

import axios from 'axios';

import './App.css';

// Limitations: File structure is only top-level folder containing files, no sub-folders
function App() {
	const [filePath, setFilePath] = useState("");	// "folder.file" format
	const [directory, setDirectory] = useState<Folder[]>([]);	// All the users files
	const [creatingFile, setCreatingFile] = useState(false);	// Creating a file
	const [creatingFolder, setCreatingFolder] = useState(false);	// Creating a folder

	const fetchFiles = async () => {
		try {
			const headers = { Accept: 'application/json' };
			const { data } = await axios.get<Folder[]>(`http://${host}/folders`, { headers: headers });
			setDirectory(data);
		} catch (error: any) {
			console.error(error.message)
		}
	}

	const postNewFolder = async (folderName: string) => {
		try {
			await axios.post(`http://${host}/folders`, {folderName: folderName});
		} catch (error) {
			console.error("Error while creating new file:", error)
		}
	}

	const postNewFile = async (folderName: string, fileName: string) => {
		try {
			await axios.post(`http://${host}/file`, { folderName: folderName, fileName: fileName });
		} catch (error) {
			console.error("Error while creating new file:", error)
		}
	}

	// Load the folders and file names on initial render
	useEffect(() => {
		fetchFiles();
	}, []);

	// Create new folder on the server, make local changes for user
	const handleFolderCreate = (folderName: string) => {
		postNewFolder(folderName);

		let dir = directory.slice();
		dir.push({
			id: getMaxId(directory) + 1,
			name: folderName,
			files: [],
		});

		setDirectory(dir);

		setCreatingFolder(false);
	}

	// Have server create new file, make local changes for user
	// TODO: Refactor keeping track of the current file
	const handleFileCreate = (fileName: string) => {
		let folderName = getFolderName(filePath);
		if (folderName === "")
			folderName = getFirstFolder(directory);

		postNewFile(folderName, fileName);

		let dir = directory.slice();
		dir.forEach(d => {
			if (d.name === folderName)
				d.files.push({
					id: getMaxId(d.files) + 1,
					"name": fileName,
					contents: [],
				});
		});

		setDirectory(dir);

		setCreatingFile(false);
	}

	return (
		<Box>
			<MyToolbar
				directory={directory}
				onFileClick={(newPath: string) => setFilePath(newPath) }
				onNewFile={() => setCreatingFile(true)}
				onNewFolder={() => setCreatingFolder(true)} />

			{filePath && <MyEditor filePath={filePath} />}

			{creatingFile && <CreateFileDialog
													onFileCreate={handleFileCreate}
													onClose={() => setCreatingFile(false)} />}
			{creatingFolder && <CreateFolderDialog
														onFolderCreate={handleFolderCreate}
														onClose={() => setCreatingFolder(false)} />}
		</Box>
  );
}

const CreateFileDialog = (props: any) => {
	const [fileName, setFileName] = useState("");

	return (
		<div>
			<Dialog open={true} onClose={props.onClose}>
				<DialogTitle>Create New File</DialogTitle>
				<DialogContent>
					<TextField
						autoFocus
						margin="dense"
						id="name"
						label="File Name"
						fullWidth
						variant="standard"
						value={fileName}
						onChange={(event: any) => setFileName(event.target.value)}
					/>
				</DialogContent>
				<DialogActions>
					<Button onClick={props.onClose}>Cancel</Button>
					<Button onClick={() => props.onFileCreate(fileName)}>Create</Button>
				</DialogActions>
			</Dialog>
		</div>
	)
}

const CreateFolderDialog = (props: any) => {
	const [folderName, setFolderName] = useState("");

	return (
		<div>
			<Dialog open={true} onClose={props.onClose}>
				<DialogTitle>Create New Folder</DialogTitle>
				<DialogContent>
					<TextField
						autoFocus
						margin="dense"
						id="name"
						label="Folder Name"
						fullWidth
						variant="standard"
						value={folderName}
						onChange={(event: any) => setFolderName(event.target.value)}
					/>
				</DialogContent>
				<DialogActions>
					<Button onClick={props.onClose}>Cancel</Button>
					<Button onClick={() => props.onFolderCreate(folderName)}>Create</Button>
				</DialogActions>
			</Dialog>
		</div>
	)
}

export default App;