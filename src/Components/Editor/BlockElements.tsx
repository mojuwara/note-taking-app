import React, { useState } from 'react';

import { Tuple } from '../../Types';
import { isProperlyDefined, updateWordDefinition } from '../../Utils';
import { useSelected,	useFocused, useSlate, RenderLeafProps } from 'slate-react';

import Box from '@mui/material/Box';
import Menu from '@mui/material/Menu';
import Popper from '@mui/material/Popper';
import MenuItem from '@mui/material/MenuItem';
import EditorCommands from './EditorCommands';
import TextField from '@mui/material/TextField';

export const Leaf = (props: RenderLeafProps) => {
	const word = props.leaf.text;
	const [definition, setDefinition] = React.useState('');

	const handleDefinitionChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
		setDefinition(event.target.value);
		updateWordDefinition(word, event.target.value);
	};

	const [anchorEl, setAnchorEl] = React.useState<HTMLElement | null>(null);
	const open = anchorEl !== null;

	const handlePopoverOpen = (event: React.MouseEvent<HTMLElement>) => {
		if (!props.leaf.isUncommonWord)
			return;

		setAnchorEl((anchorEl === null) ? event.currentTarget : null);
	};

	const getBackgroundColor = () => {
		if (!props.leaf.isUncommonWord)
			return undefined;

		return (isProperlyDefined(word)) ? 'lightgrey' : 'sandybrown';
	}

	const style: React.CSSProperties = {
		backgroundColor: getBackgroundColor(),
		fontWeight: (props.leaf.bold) ? 'bold' : 'normal',
		fontStyle: (props.leaf.italic) ? 'italic' : 'normal',
		textDecoration: (props.leaf.underline) ? 'underline' : 'none',
	}

	return (
		<>
			<span style={style} {...props.attributes} onClick={handlePopoverOpen}>
				{props.children}
			</span>
			<Popper open={open} anchorEl={anchorEl} placement='bottom-start'>
				<Box sx={{ border: 1, bgcolor: 'background.paper' }}>
					{<DictionaryPopup word={word} definition={definition} handleChange={handleDefinitionChange} />}
				</Box>
			</Popper>
		</>
	);
}

// TODO: Latex support, show common formulas/conversions
// TODO: Save button so we update the dictionary less frequently?
type DictionaryPopupProps = {
	word: string;
	definition: string;
	handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
};
export const DictionaryPopup = (props: DictionaryPopupProps) => {
	// TODO: MUI: Too many re-renders. The layout is unstable.
	return (
		<TextField
			rows={2}
			multiline
			variant="filled"
			value={props.definition}
			// onClick={handleClick}
			onChange={props.handleChange}
			label={`${props.word} definition`}
		/>
	);
}

export const DefaultBlockElement = (props: any) => {
	return <span {...props.attributes}>{props.children}</span>;
}

export const ParagraphBlockElement = (props: any) => {
	return <p {...props.attributes} style={{ margin: 1 }}>{props.children}</p>;
}

export const CodeBlockElement = (props: any) => {
	return (
		<pre {...props.attributes}>
			<code>{props.children}</code>
		</pre>
	);
}

export const OrderedListBlockElement = (props: any) => {
	return (
		<ol style={{margin: 8 }} {...props.attributes}>
			{props.children}
		</ol>
	);
}

export const UnorderedListBlockElement = (props: any) => {
	return (
		<ul style={{ margin: 8 }} {...props.attributes}>
			{props.children}
		</ul>
	);
}

export const ListItemBlockElement = (props: any) => {
	return (
		<li {...props.attributes}>
			{props.children}
		</li>
	);
}

export const H1BlockElement = (props: any) => {
	return (
		<h1 {...props.attributes}>
			{props.children}
		</h1>
	);
}

export const H2BlockElement = (props: any) => {
	return (
		<h2 {...props.attributes}>
			{props.children}
		</h2>
	);
}

export const H3BlockElement = (props: any) => {
	return (
		<h3 {...props.attributes}>
			{props.children}
		</h3>
	);
}

export const ImageBlockElement = (props: any) => {
	const selected = useSelected();
	const focused = useFocused();
	return (
		<span {...props.attributes}>
			<span style={{width: 0, height: 0}}>
				{props.children}
			</span>
			<span contentEditable={false}>
				<img
					alt={props.url}
					src={props.element.url}
					style={{
						margin: 1,
						maxWidth: '100%',
						maxHeight: '20em',
						boxShadow: selected && focused ? '0 0 0 3px #B4D5FF' : 'none',
					}} />
			</span>
		</span>
	)
}

export const LinkBlockElement = (props: any) => {
	return (
		<a
			{...props.attributes}
			href={props.element.href}
			onClick={(e) => { if (e.metaKey) { window.open(props.element.href, '_blank') } }}
		>
			<span contentEditable={false}>{props.children}</span>
		</a>
	);
}

export const TableBlockElement = (props: any) => {
	return (
		<table
			border={1}
			{...props.attributes}
			style={{
				marginTop: 16,
				marginLeft: 10,
				marginBottom: 16,
				borderCollapse: "collapse",
			}}
		>
			{props.children}
		</table>);
}

export const TableHeadBlockElement = (props: any) => {
	return <thead style={{backgroundColor: 'lightsteelblue'}} {...props.attributes}>{props.children}</thead>;
}

export const TableRowBlockElement = (props: any) => {
	return <tr {...props.attributes}>{props.children}</tr>;
}

// TODO - Center the ellipse
export const TableHeaderBlockElement = (props: any) => {
	const editor = useSlate();
	const [menuOpen, setMenuOpen] = useState(false);
	const [anchorEl, setAnchorEl] = useState<null | HTMLElement>();

	const pos: Tuple<number> = props.element?.pos;
	const selectedPos: Tuple<number> = props.element?.selectedPos;
	const onCol = selectedPos && selectedPos[1] === pos[1];

	const handleClick = (e: React.MouseEvent<HTMLSpanElement, MouseEvent>) => {
		e.preventDefault();
		e.stopPropagation();

		setMenuOpen(!menuOpen);
		setAnchorEl(e.currentTarget);
	}

	const addCol = (colNum: number) => {
		setMenuOpen(false);
		EditorCommands.insertTableCol(editor, colNum);
	}

	return (
		<th style={{ position: 'relative', minHeight: 34, minWidth: 64 }} {...props.attributes}>
			{onCol && <span
				contentEditable={false}
				onClick={e => handleClick(e)}
				style={{ position: 'absolute', bottom: 23, cursor: 'pointer', fontWeight: 'bold' }}
				>
					...
				</span>
			}
			<Menu anchorEl={anchorEl} open={menuOpen} onClose={() => setMenuOpen(false)}>
				<MenuItem onClick={() => addCol(pos[1])}>Insert col to left</MenuItem>
				<MenuItem onClick={() => addCol(pos[1] + 1)}>Insert col to right</MenuItem>
			</Menu>
			{props.children}
		</th>
	);
}

export const TableBodyBlockElement = (props: any) => {
	return <tbody {...props.attributes}>{props.children}</tbody>;
}

export const TableDataBlockElement = (props: any) => {
	const editor = useSlate();
	const [menuOpen, setMenuOpen] = useState(false);
	const [anchorEl, setAnchorEl] = useState<null | HTMLElement>();

	const pos: Tuple<number> = props.element?.pos;
	const selectedPos: Tuple<number> = props.element?.selectedPos;

	const onRow = selectedPos // Some cell is selected
		&& selectedPos[0] > 0 	// On a data row, not header row
		&& pos[1] === 0 			//
		&& selectedPos[0] === pos[0];	// This cells row matches row of selected cell;

	const handleClick = (e: React.MouseEvent<HTMLSpanElement, MouseEvent>) => {
		e.preventDefault();
		e.stopPropagation();

		setMenuOpen(!menuOpen);
		setAnchorEl(e.currentTarget);
	}

	const addRow = (rowNum: number) => {
		setMenuOpen(false);
		EditorCommands.insertTableRow(editor, rowNum);
	}

	return (
		<td style={{ minHeight: 34, minWidth: 64 }} {...props.attributes}>
			{onRow && <span
				contentEditable={false}
				onClick={e => handleClick(e)}
				style={{ position: 'absolute', display: 'inline-block', left: 5, cursor: 'pointer', transform: 'rotate(90deg)', fontWeight: 'bold' }}
				>
					...
				</span>
			}
			<Menu anchorEl={anchorEl} open={menuOpen} onClose={() => setMenuOpen(false)}>
				<MenuItem onClick={() => addRow(pos[0])}>Insert row above</MenuItem>
				<MenuItem onClick={() => addRow(pos[0] + 1)}>Insert row below</MenuItem>
			</Menu>
			{props.children}
		</td>
	);
}