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

const DrawerHeader = styled('div')(({ theme }) => ({
	display: 'flex',
	alignItems: 'center',
	padding: theme.spacing(0, 1),
	// necessary for content to be below app bar
	...theme.mixins.toolbar,
	justifyContent: 'start',
}));

const MyToolbar = (props: any) => {
	const theme = useTheme();
	const [open, setOpen] = useState(false);

	const handleDrawerOpen = () => setOpen(true);
	const handleDrawerClose = () => setOpen(false);

	const DrawerWidth = 240;
	const drawerStyle = {
		width: DrawerWidth,
		flexShrink: 0,
		'& .MuiDrawer-paper': {
			width: DrawerWidth,
			boxSizing: 'border-box',
		},
	}

	return (
		// <Box sx={{display: 'flex'}}>
		<>
			<AppBar position="sticky">
				<Toolbar>
					<IconButton
						color="inherit"
						aria-label="open drawer"
						onClick={handleDrawerOpen}
						edge="start"
					// sx={{ mr: 2, ...(open && { display: 'none' }) }}
					>
						<MenuIcon />
					</IconButton>
				</Toolbar>
			</AppBar>

			<Drawer sx={drawerStyle} variant="persistent" anchor="left" open={open}>
				<DrawerHeader>
					<IconButton onClick={props.onNewFolder}>
						<CreateNewFolderIcon />
					</IconButton>
					<IconButton onClick={props.onNewFile}>
						<NoteAddIcon />
					</IconButton>
					<IconButton onClick={handleDrawerClose}>
						{theme.direction === 'ltr' ? <ChevronLeftIcon /> : <ChevronRightIcon />}
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