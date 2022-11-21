import { useState } from 'react';

import Box from '@mui/material/Box';
import Popper from '@mui/material/Popper';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import ImageOutlinedIcon from '@mui/icons-material/ImageOutlined';
import TableRowsOutlinedIcon from '@mui/icons-material/TableRowsOutlined';
import InsertLinkOutlinedIcon from '@mui/icons-material/InsertLinkOutlined';

import { useSlate } from 'slate-react';

import EditorCommands from './EditorCommands';
import { focusOnEditor } from '../../Utils';
import { ElementTypes } from '../../Types';

export const MarkButton = (props: any) => {
	const editor = useSlate();
	const { mark, label, icon } = props;

	const handleClick = (e: any) => {
		e.preventDefault();
		EditorCommands.toggleMark(editor, mark);
		focusOnEditor();
	}

	const markActive = EditorCommands.isMarkActive(editor, mark);
	return (
		<IconButton
			aria-label={label}
			onMouseDown={handleClick}
			color={(markActive) ? "secondary" : "default"}
		>
			{icon}
		</IconButton>
	)
};

export const UploadImageButton = () => {
	const editor = useSlate();
	const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
		if (!e.target.files || !e.target.files.length)
			return;

		for (let i = 0; i < e.target.files.length; i++) {
			const file = e.target.files.item(i);
			if (file)
				EditorCommands.insertImage(editor, file);
		}
		focusOnEditor();
	}

	return (
		<span>
			<IconButton aria-label={"Upload files"} component="label">
				<input hidden type="file" multiple accept="image/*" onChange={handleChange} />
				<ImageOutlinedIcon />
			</IconButton>
		</span>
	)
};

export const LinkInsertButton = (props: any) => {
	const editor = useSlate();

	const [href, setHref] = useState('');
	const [open, setOpen] = useState(false);
	const [displayText, setDisplayText] = useState('');
	const [anchorEl, setAnochorEl] = useState<null | HTMLElement>(null);

	const handleClick = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
		setOpen(!open);
		e.stopPropagation();
		setAnochorEl(e.currentTarget);
	};

	const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, setter: React.Dispatch<React.SetStateAction<string>>) => {
		e.stopPropagation();
		setter(e.target.value);
	};

	const handleCreateClick = () => {
		EditorCommands.insertLink(editor, href, displayText)
		focusOnEditor();
	}

	// TODO: Close on outside click or change to dialogue
	return (
		<IconButton aria-label={"Insert link"} onClick={(e) => handleClick(e)}>
			<InsertLinkOutlinedIcon />
			<Popper open={open} anchorEl={anchorEl}>
				<Box sx={{ border: 1, p: 1, bgcolor: 'background.paper' }}>
					<TextField onClick={(e) => e.stopPropagation()} label={ElementTypes.LINK} variant="outlined" size="small" onChange={e => handleChange(e, setHref)} />
					<TextField onClick={(e) => e.stopPropagation()} label="Display" variant="outlined" size="small" onChange={e => handleChange(e, setDisplayText)} />
					<Button variant="contained" onClick={handleCreateClick}>
						Create
					</Button>
				</Box>
			</Popper>
		</IconButton>
	);
};

export const InsertTableButton = () => {
	const editor = useSlate();
	const handleClick = () => {
		EditorCommands.insertTable(editor);
		focusOnEditor();
	}

	return (
		<IconButton aria-label={"Insert table"} onClick={handleClick}>
			<TableRowsOutlinedIcon />
		</IconButton>
	);
};

export const BlockButton = (props: any) => {
	const editor = useSlate();
	const { block, label, icon } = props;

	const handleClick = (e: any) => {
		e.preventDefault();
		EditorCommands.toggleBlock(editor, block);
		focusOnEditor();
	}

	const blockActive = EditorCommands.isBlockActive(editor, block);
	return (
		<IconButton
			aria-label={label}
			onMouseDown={handleClick}
			color={(blockActive) ? "secondary" : "default"}>
			{icon}
		</IconButton>
	)
};