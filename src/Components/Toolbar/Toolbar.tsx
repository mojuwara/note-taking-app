import { useState, useEffect, useRef } from 'react'

import { API } from 'aws-amplify';
import * as queries from '../../graphql/queries';
import * as mutations from '../../graphql/mutations';
import { GraphQLResult } from '@aws-amplify/api-graphql';


import { Folder, FileSelection } from '../../Types';
import { DefaultFileContent, DrawerWidth, StorageKeys } from '../../Constants';

import { styled, useTheme } from '@mui/material/styles';

import Box from '@mui/material/Box';
import Menu from '@mui/material/Menu';
import AppBar from '@mui/material/AppBar';
import Drawer from '@mui/material/Drawer';
import Toolbar from '@mui/material/Toolbar';
import Divider from '@mui/material/Divider';
import MenuItem from '@mui/material/MenuItem';
import MenuIcon from '@mui/icons-material/Menu';
import IconButton from '@mui/material/IconButton';
import NoteAddIcon from '@mui/icons-material/NoteAdd';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import CreateNewFolderIcon from '@mui/icons-material/CreateNewFolder';

import Directory from './Directory';
import CreateItemDialog from './CreateItemDialog';

import { createNewFile, createNewFolder, getStorageItem, getTransitionElemClass, storeFileContent } from '../../Utils';

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
	user: any;
	drawerOpen: boolean;
	signoutBtn: JSX.Element;
	onDrawerOpen: () => void;
	onDrawerClose: () => void;
	fileSelection: FileSelection;
	onSelectionChange: (s: FileSelection) => void;
}

const MyToolbar = (props: ToolbarProps) => {
	const  hasDir = useRef(false);
	const [creatingFile, setCreatingFile] = useState(false);	// Creating a file
	const [creatingFolder, setCreatingFolder] = useState(false);	// Creating a folder
	const [directory, setDirectory] = useState<Folder[]>(getStorageItem<Folder[]>(StorageKeys.Dir, []));	// All the users files
	const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
	const acntMenuOpen = anchorEl !== null;

	// Load the folders and file names on initial render
	useEffect(() => {
		const fetchDir = async () => {
			try {
				const response = await API.graphql({
					query: queries.getDirectory,
					variables: {user: props.user.username},
				}) as GraphQLResult<any>;
				const directory = response.data?.getDirectory?.directory;
				hasDir.current = !!directory;
				const userDir: Folder[] = (directory) ? JSON.parse(directory) : [];
				setDirectory(userDir);
				localStorage.setItem(StorageKeys.Dir, JSON.stringify(userDir));
			} catch (error: any) {
				console.error(error)
			}
		}

		fetchDir();
	}, [props.user]);

	const updateDir = async (newDir: Folder[]) => {
		setDirectory(newDir);
		localStorage.setItem(StorageKeys.Dir, JSON.stringify(newDir));

		try {
				await API.graphql({
				query: (hasDir.current) ? mutations.updateDirectory : mutations.createDirectory,
				variables: {input: { user: props.user.username,	directory: JSON.stringify(newDir) }}
			});
		} catch (error) {
			console.log(error)
		}
	}

	const createFile = (fileName: string) => {
		const [success, newDir, selection] = createNewFile(directory, props.fileSelection, fileName);
		if (success) {
			updateDir(newDir);
			setCreatingFile(false);
			props.onSelectionChange(selection);
			storeFileContent(`${props.user.username}/${selection.folder}/${selection.file}`, DefaultFileContent);
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
						<IconButton
							color="inherit"
							aria-label="Account Menu"
							onClick={e => setAnchorEl(e.currentTarget)}
							edge="start"
						>
							<AccountCircleIcon />
						</IconButton>
						<Menu
							anchorEl={anchorEl}
							id="account-menu"
							open={acntMenuOpen}
							onClose={() => setAnchorEl(null)}
							onClick={() => setAnchorEl(null)}
							transformOrigin={{ horizontal: 'right', vertical: 'top' }}
							anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
						>
							<MenuItem>
								{props.signoutBtn}
							</MenuItem>
						</Menu>
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