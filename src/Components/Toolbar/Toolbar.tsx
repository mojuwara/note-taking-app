import { useState, useEffect } from 'react'

import { FileSep, host } from '../../Constants';
import { Folder, File } from '../../Types';

import { styled, useTheme } from '@mui/material/styles';

import AppBar from '@mui/material/AppBar';
import Drawer from '@mui/material/Drawer';
import Toolbar from '@mui/material/Toolbar';
import Divider from '@mui/material/Divider';
import MenuIcon from '@mui/icons-material/Menu';
import IconButton from '@mui/material/IconButton';
import NoteAddIcon from '@mui/icons-material/NoteAdd';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import CreateNewFolderIcon from '@mui/icons-material/CreateNewFolder';

import List from '@mui/material/List';
import Collapse from '@mui/material/Collapse';
import ListItemText from '@mui/material/ListItemText';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import ListItemButton from '@mui/material/ListItemButton';


import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';

import { createNewFile, createNewFolder, getDirFromFilePath, getItemLevel, getTransitionElemClass, isSubDir } from '../../Utils';

import axios from 'axios';	// TODO: Do we NEED axios?

import '../../App.css';

const DrawerWidth = 240;
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
	selectedFilePath: string;
	onDrawerOpen: () => void;
	onDrawerClose: () => void;
	onFileClick: (s: string) => void;
}

const MyToolbar = (props: ToolbarProps) => {
	const [directory, setDirectory] = useState<Folder[]>([]);	// All the users files
	const [creatingFile, setCreatingFile] = useState(false);	// Creating a file
	const [creatingFolder, setCreatingFolder] = useState(false);	// Creating a folder

	// Load the folders and file names on initial render
	useEffect(() => {
		const fetchFiles = async () => {
			try {
				const headers = { Accept: 'application/json' };
				const { data } = await axios.get<Folder[]>(`http://${host}/folders`, { headers: headers });
				setDirectory(data);
			} catch (error: any) {
				console.error(error.message)
			}
		}

		fetchFiles();
	}, []);

	const createFile = (fileName: string) => {
		const [success, newDir, selectedPath] = createNewFile(directory, props.selectedFilePath, fileName);
		if (success) {
			setDirectory(newDir);
			props.onFileClick(selectedPath);
			setCreatingFile(false);
		} else {
			alert("Ensure this file name is unique");
		}
	}

	const createFolder = (folderName: string) => {
		const [success, newDir] = createNewFolder(directory, props.selectedFilePath, folderName);
		if (success) {
			setCreatingFolder(false);
			setDirectory(newDir);
		}
		else
			alert("Ensure this folder name is unique");
	}

	const theme = useTheme();
	const transitionClass = getTransitionElemClass(props.drawerOpen);

	return (
		<>
			{creatingFile && <CreateFileDialog
				onFileCreate={createFile}
				onClose={() => setCreatingFile(false)}
				dirName={getDirFromFilePath(props.selectedFilePath)} />}
			{creatingFolder && <CreateFolderDialog onFolderCreate={createFolder} onClose={() => setCreatingFolder(false)} />}

			<AppBar position="fixed" className={transitionClass}>
				<Toolbar>
					<IconButton
						color="inherit"
						aria-label="open drawer"
						onClick={props.onDrawerOpen}
						edge="start"
					sx={{ mr: 2, ...(props.drawerOpen && { display: 'none' }) }}
					>
						<MenuIcon />
					</IconButton>
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
		</>
	);
}

type DirectoryProps = {
	directory: Folder[];
	selectedFilePath: string;
	onFileClick: (s: string) => void;
}

const Directory = (props: DirectoryProps) => {
	console.log(props.directory);
	const listItems = props.directory.map((folder: Folder, ndx: any) =>
		<FolderListItem
			key={ndx}
			folder={folder}
			folderPath={folder.name}
			onFileClick={props.onFileClick}
			selectedFilePath={props.selectedFilePath} />
	)

	const dirStyle = { width: '100%', maxWidth: DrawerWidth, bgcolor: 'background.paper' };
	return (
		<List sx={dirStyle} component="nav">
			{listItems}
		</List>
	);
}

type FolderListItemProps = {
	folder: Folder;
	folderPath: string;
	selectedFilePath : string;
	onFileClick: (s: string) => void;
}

// TODO: fix isSelected - Foldres with only matching prefix will be selected
const FolderListItem = (props: FolderListItemProps) => {
	const [open, setOpen] = useState(false);

	let isSelected: boolean;
	if (props.selectedFilePath.length && isSubDir(props.selectedFilePath, props.folderPath))
		isSelected = true;
	else
		isSelected = false;

	return (
		<>
			<ListItemButton
				selected={isSelected}
				onClick={() => setOpen(!open)}
				sx={{ pl: 4 * getItemLevel(props.folderPath) }}
			>
				<ListItemText primary={props.folder.name} />
				{open ? <ExpandLess /> : <ExpandMore />}
			</ListItemButton>

			<Collapse in={open} timeout="auto" unmountOnExit>
				<List component="div" disablePadding>
					{props.folder.items.map((item: File | Folder, ndx: number) =>
						("items" in item)
							?	<FolderListItem
								key={ndx}
								folder={item}
								onFileClick={props.onFileClick}
								folderPath={FileSep + props.folderPath}
								selectedFilePath={props.selectedFilePath} />
							: <FileListItem
								key={ndx}
								file={item}
								onFileClick={props.onFileClick}
								selectedFilePath={props.selectedFilePath}
								filePath={props.folderPath + FileSep + item.name} />
					)}
				</List>
			</Collapse>
		</>
	)
}

type FileListItemProps = {
	file: File;
	filePath: string;
	selectedFilePath: string;
	onFileClick: (s: string) => void;
}

const FileListItem = (props: FileListItemProps) => {
	let isSelected: boolean;
	if (props.selectedFilePath && isSubDir(props.selectedFilePath, props.filePath))
		isSelected = true;
	else
		isSelected = false;

	return (
		<ListItemButton
			selected={isSelected}
			sx={{ pl: 4 * getItemLevel(props.filePath) }}
			onClick={() => props.onFileClick(props.filePath)}
		>
			<ListItemText primary={props.file.name} />
		</ListItemButton>
	)
}

// TODO: Update colors for new file icon and new folder icon
// TODO: Use composition on CreateFileDialog and CreateFolderDialog
type CreateFileProps = {
	dirName: string;
	onClose: () => void;
	onFileCreate: (s: string) => void;
}

const CreateFileDialog = (props: CreateFileProps) => {
	const [fileName, setFileName] = useState("");

	const title = (props.dirName) ? `Create a new file in '${props.dirName}'` : "Create a new file"
	return (
		<div>
			<Dialog open={true} onClose={props.onClose}>
				<DialogTitle>{title}</DialogTitle>
				<DialogContent>
					<TextField
						id="name"
						autoFocus
						fullWidth
						margin="dense"
						value={fileName}
						label="File Name"
						variant="standard"
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

type CreateFolderProps = {
	onClose: () => void;
	onFolderCreate: (s: string) => void;
}

const CreateFolderDialog = (props: CreateFolderProps) => {
	const [folderName, setFolderName] = useState("");

	return (
		<div>
			<Dialog open={true} onClose={props.onClose}>
				<DialogTitle>Create New Folder</DialogTitle>
				<DialogContent>
					<TextField
						id="name"
						autoFocus
						fullWidth
						margin="dense"
						variant="standard"
						value={folderName}
						label="Folder Name"
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

export default MyToolbar;