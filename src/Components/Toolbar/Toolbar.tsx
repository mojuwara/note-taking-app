import { useState, useEffect } from 'react'

import { DrawerWidth, host, StorageKeys } from '../../Constants';
import { Folder, FileSelection } from '../../Types';

import { styled, useTheme } from '@mui/material/styles';

import Box from '@mui/material/Box';
import AppBar from '@mui/material/AppBar';
import Drawer from '@mui/material/Drawer';
import Toolbar from '@mui/material/Toolbar';
import Divider from '@mui/material/Divider';
import MenuIcon from '@mui/icons-material/Menu';
import IconButton from '@mui/material/IconButton';
import NoteAddIcon from '@mui/icons-material/NoteAdd';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import CreateNewFolderIcon from '@mui/icons-material/CreateNewFolder';

import { createNewFile, createNewFolder, getStorageItem, getTransitionElemClass } from '../../Utils';

import axios from 'axios';	// TODO: Do we NEED axios?
import CreateItemDialog from './CreateItemDialog';
import Directory from './Directory';

import '../../App.css';

const DrawerHeader = styled('div')(({ theme }) => ({
	display: 'flex',
	alignItems: 'center',
	padding: theme.spacing(0, 1),
	// necessary for content to be below app bar
	...theme.mixins.toolbar,
	justifyContent: 'start',
}));

const drawerStyle = {
	width: DrawerWidth,
	flexShrink: 0,
	'& .MuiDrawer-paper': {
		width: DrawerWidth,
		boxSizing: 'border-box',
	},
}

type ToolbarProps = {
	drawerOpen: boolean;
	onDrawerOpen: () => void;
	onDrawerClose: () => void;
	fileSelection: FileSelection;
	onSelectionChange: (s: FileSelection) => void;
}

const MyToolbar = (props: ToolbarProps) => {
	const [creatingFile, setCreatingFile] = useState(false);	// Creating a file
	const [creatingFolder, setCreatingFolder] = useState(false);	// Creating a folder
	const [directory, setDirectory] = useState<Folder[]>(getStorageItem<Folder[]>(StorageKeys.Dir, []));	// All the users files

	const updateDir = (newDir: Folder[]) => {
		setDirectory(newDir);
		localStorage.setItem(StorageKeys.Dir, JSON.stringify(newDir));
	}
	// Load the folders and file names on initial render
	// useEffect(() => {
	// 	const fetchFiles = async () => {
	// 		try {
	// 			const headers = { Accept: 'application/json' };
	// 			const { data } = await axios.get<Folder[]>(`http://${host}/folders`, { headers: headers });
	// 			setDirectory(data);
	// 			localStorage.setItem(StorageKeys.Dir, JSON.stringify(data));
	// 		} catch (error: any) {
	// 			console.error(error.message)
	// 		}
	// 	}

	// 	fetchFiles();
	// }, []);

	const createFile = (fileName: string) => {
		const [success, newDir, selection] = createNewFile(directory, props.fileSelection, fileName);
		if (success) {
			updateDir(newDir);
			setCreatingFile(false);
			props.onSelectionChange(selection);
		} else {
			alert("Ensure this file name is unique");
		}
	}

	const createFolder = (folderName: string) => {
		const [success, newDir] = createNewFolder(directory, props.fileSelection, folderName);
		if (success) {
			updateDir(newDir);
			setCreatingFolder(false);
			const selection: FileSelection = { folder: folderName, file: "" };
			props.onSelectionChange(selection);
		}
		else
			alert("Ensure this folder name is unique");
	}

	const theme = useTheme();
	const transitionClass = getTransitionElemClass(props.drawerOpen);

	return (
		<Box>
			{creatingFile && <CreateItemDialog
				label="File Name"
				onCreate={createFile}
				onClose={() => setCreatingFile(false)}
				title={"Create file" + (props.fileSelection.folder ? ` in '${props.fileSelection.folder}'` : "")} />}
			{creatingFolder && <CreateItemDialog
				label="Folder Name"
				onCreate={createFolder}
				title="Create new folder"
				onClose={() => setCreatingFolder(false)} />}

			<AppBar position="fixed">
				<Toolbar className={transitionClass}>
					<Box sx={{width: '100%', display: 'flex', justifyContent: 'space-between'}}>
						<IconButton
							color="inherit"
							aria-label="open drawer"
							onClick={props.onDrawerOpen}
							disabled={props.drawerOpen}
							edge="start"
							sx={{ mr: 2, ...(props.drawerOpen && { visibility: 'hidden' }) }}
						>
							<MenuIcon />
						</IconButton>
						<h1 style={{padding: 0, margin: 0, fontSize: 24}}>Study Buddy</h1>
						<AccountCircleIcon />
					</Box>
				</Toolbar>
			</AppBar>
			<Toolbar />	 {/* To fix issue with Toolbar rendering over content when position=fixed, which is needed to transition nicely*/}

			<Drawer sx={drawerStyle} variant="persistent" anchor="left" open={props.drawerOpen}>
				<DrawerHeader>
					<IconButton onClick={props.onDrawerClose}>
						{theme.direction === 'ltr' ? <ChevronLeftIcon /> : <ChevronRightIcon />}
					</IconButton>
					<IconButton onClick={() => setCreatingFolder(true)}>
						<CreateNewFolderIcon />
					</IconButton>
					<IconButton onClick={() => setCreatingFile(true)}>
						<NoteAddIcon />
					</IconButton>
				</DrawerHeader>
				<Divider />

				<Directory {...props} directory={directory} />
			</Drawer>
		</Box>
	);
}

export default MyToolbar;