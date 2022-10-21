import { useState } from 'react';

import List from '@mui/material/List';
import Collapse from '@mui/material/Collapse';
import ListItemText from '@mui/material/ListItemText';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import ListItemButton from '@mui/material/ListItemButton';

import { FileSep, DrawerWidth } from '../../Constants';
import { Folder, File, FileSelection } from '../../Types';
import { getFirstFile, getFullPath } from '../../Utils';

type DirectoryProps = {
	directory: Folder[];
	fileSelection: FileSelection;
	onSelectionChange: (s: FileSelection) => void;
}

const Directory = (props: DirectoryProps) => {
	console.log(props.directory);
	const listItems = props.directory.map((folder: Folder, ndx: any) =>
		<FolderListItem
			key={ndx}
			folder={folder}
			folderPath={folder.name}
			onSelectionChange={props.onSelectionChange}
			fileSelection={props.fileSelection} />
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
	fileSelection: FileSelection;
	onSelectionChange: (s: FileSelection) => void;
}

// TODO: fix isSelected - Foldres with only matching prefix will be selected
const FolderListItem = (props: FolderListItemProps) => {
	const isSelected = props.folder.name === props.fileSelection.folder;
	const [open, setOpen] = useState(isSelected);

	// const isSelected = isSubDir(getFullPath(props.fileSelection), props.folderPath);

	const handleItemClick = () => {
		setOpen(!open);
		props.onSelectionChange({ folder: props.folder.name, file: getFirstFile(props.folder.items) });
	}
	return (
		<>
			<ListItemButton
				selected={isSelected}
				onClick={handleItemClick}
				sx={{ pl: 1 }}
			>
				<ListItemText primary={props.folder.name} />
				{open ? <ExpandLess /> : <ExpandMore />}
			</ListItemButton>

			<Collapse in={open} timeout="auto" unmountOnExit>
				<List component="div" disablePadding>
					{props.folder.items.map((item: File, ndx: number) =>
						<FileListItem
							key={ndx}
							file={item}
							onFileClick={props.onSelectionChange}
							fileSelection={props.fileSelection}
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
	fileSelection: FileSelection;
	onFileClick: (s: FileSelection) => void;
}

const FileListItem = (props: FileListItemProps) => {
	console.log(props);
	const isSelected = getFullPath(props.fileSelection) === props.filePath;

	const getContainingFolder = (): string => {
		const parts = props.filePath.split(FileSep);
		return parts[parts.length - 2];	// Last item is file name, item prior is folder name
	}

	const getUpdatedSelection = (): FileSelection => {
		return {
			file: props.file.name,
			folder: getContainingFolder(),
		}
	}
	return (
		<ListItemButton
			selected={isSelected}
			sx={{ pl: 4 }}
			onClick={() => props.onFileClick(getUpdatedSelection())}
		>
			<ListItemText primary={props.file.name} />
		</ListItemButton>
	)
}

export default Directory;