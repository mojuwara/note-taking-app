import { useState } from 'react'

import { FileSep } from '../../Constants';
import { Folder } from '../../Types';

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

import { getTransitionElemClass } from '../../Utils';

import '../../App.css';

const DrawerHeader = styled('div')(({ theme }) => ({
	display: 'flex',
	alignItems: 'center',
	padding: theme.spacing(0, 1),
	// necessary for content to be below app bar
	...theme.mixins.toolbar,
	justifyContent: 'start',
}));

// TODO: Highlight the selected folder and the selected file
// TODO: Auto close toolbar when you select a file
// TODO: Choose a color that better contrasts grey when bold/italic/etc.
// TODO: Put name of the application in toolbar center
// TODO: Shrink the editor when Drawer is open, expand editor when drawer is closed
// TODO: Keyboard shortcut to hide Drawer
const DrawerWidth = 240;
const MyToolbar = (props: any) => {
	const theme = useTheme();
	const transitionClass = getTransitionElemClass(props.drawerOpen);

	const drawerStyle = {
		width: DrawerWidth,
		flexShrink: 0,
		'& .MuiDrawer-paper': {
			width: DrawerWidth,
			boxSizing: 'border-box',
		},
	}

	return (
		<>
			<AppBar position="fixed" className={transitionClass}>
				<Toolbar>
					<IconButton
						color="inherit"
						aria-label="open drawer"
						onClick={props.handleDrawerOpen}
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
					<IconButton onClick={props.handleDrawerClose}>
						{theme.direction === 'ltr' ? <ChevronLeftIcon /> : <ChevronRightIcon />}
					</IconButton>
					<IconButton onClick={props.onNewFolder}>
						<CreateNewFolderIcon />
					</IconButton>
					<IconButton onClick={props.onNewFile}>
						<NoteAddIcon />
					</IconButton>
				</DrawerHeader>
				<Divider />

				<List
					sx={{ width: '100%', maxWidth: DrawerWidth, bgcolor: 'background.paper' }}
					component="nav"
				>
					{props.directory.map((folder: Folder, ndx: any) => <FolderListItem key={ndx} folder={folder} onFileClick={props.onFileClick} />)}
				</List>
			</Drawer>
		</>
	);
}

const FolderListItem = (props: any) => {
	const [open, setOpen] = useState(false);

	return (
		<>
			<ListItemButton onClick={() => setOpen(!open)}>
				<ListItemText primary={props.folder.name} />
				{open ? <ExpandLess /> : <ExpandMore />}
			</ListItemButton>

			<Collapse in={open} timeout="auto" unmountOnExit>
				<List component="div" disablePadding>
					{props.folder.files.map((file: any, ndx: number) =>
						<FileListItem
							key={ndx}
							file={file}
							folderName={props.folder.name}
							onFileClick={props.onFileClick} />)}
				</List>
			</Collapse>
		</>
	)
}

const FileListItem = (props: any) => {
	const filePath = [props.folderName, props.file.name].join(FileSep);
	return (
		<ListItemButton sx={{ pl: 4 }} onClick={() => props.onFileClick(filePath)}>
			<ListItemText primary={props.file.name} />
		</ListItemButton>
	)
}

export default MyToolbar;