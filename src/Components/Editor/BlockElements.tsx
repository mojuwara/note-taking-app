import React, { useState } from 'react';

import Popper from '@mui/material/Popper';

import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import { useSelected,	useFocused, useSlate } from 'slate-react';
import { Tuple } from '../../Types';

import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import EditorCommands from './EditorCommands';

// Contains the actual block elements
export const BlockElementContainer = ({ element, suggestions }: any) => {
	const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

	const handleMouseEnter = (e: any) => setAnchorEl(e.currentTarget);

	const handleMouseLeave = (e: any) => setAnchorEl(null);

	const popover = (
		<Popper open={Boolean(anchorEl)} anchorEl={anchorEl} placement="right">
				<Card variant="outlined" sx={{margin: 0}}>
					<CardContent>
						{suggestions.map((val: any, ndx: any) => <p key={ndx}>{val}</p>)}
					</CardContent>
				</Card>
		</Popper>
	);

	return (
		<div>
			<span
				onMouseEnter={handleMouseEnter}
				onMouseLeave={handleMouseLeave}
				style={{ display: 'inline-block', background: (suggestions.length) ? "lightgrey" : "white" }}>
				{element}
			</span>
			{(suggestions.length > 0) && popover}
		</div>
	);
}

// Element renderers
export const DefaultBlockElement = (props: any) => {
	return <span {...props.attributes}>{props.children}</span>;
}

export const ParagraphBlockElement = (props: any) => {
	return <p {...props.attributes} style={{ margin: 1 }}>{props.children}</p>;
}

export const CodeBlockElement = (props: any) => {
	return (
		// props.attributes contains attrs that should be rendered at top-most elem of your block
		// props.children contains the leaves, the text nodes
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

export const ContainerBlockElement = (props: any) => {
	return <div {...props.attributes}>{props.children}</div>;
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
				<img style={{
					maxWidth: '100%',
					maxHeight: '20em',
					marginTop: 1,
					marginBottom: 1,
					boxShadow: selected && focused ? '0 0 0 3px #B4D5FF' : 'none',
				}} alt={props.url} src={props.element.url} />
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
			{props.children}
		</a>
	);
}

// export const TableContainerBlockElement = (props: any) => {
// 	const table: TableElement = props.children[0];
// 	const tableBody: TableBodyElement = table.children[1] as TableBodyElement;	// Child is always a table

// 	const nRows = tableBody.children.length + 1;					// +1 for the table header row
// 	const nCols = tableBody.children[0].children.length;	// Number of data cells in first data row

// 	// Augment table children with contendEditable=false cells  +2 rows and borders
// 	const tableElems = [];
// 	for (let i = 0; i < nRows + 2; i++) {
// 		for (let j = 0; j < nCols + 2; j++) {

// 		}
// 	}

// 	return (
// 		<table border={0}>
// 			<tbody>

// 			</tbody>
// 		</table>
// 	)
// }

export const TableBlockElement = (props: any) => {
	return (
		<table
			border={1}
			{...props.attributes}
			style={{
				marginTop: 10,
				marginLeft: 10,
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

// TODO - Center the horizontal button
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

	const addCol = (dir: 'left' | 'right') => {
		setMenuOpen(false);
		EditorCommands.addTableCol(editor, pos[1], dir);
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
				<MenuItem onClick={() => addCol('left')}>Insert col to left</MenuItem>
				<MenuItem onClick={() => addCol('right')}>Insert col to right</MenuItem>
			</Menu>
			{/* {props.element?.pos?.toString()} */}
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

	const addRow = (dir: 'above' | 'below') => {
		setMenuOpen(false);
		EditorCommands.addTableRow(editor, pos[0], dir);
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
			{/* {props.element?.pos?.toString()} */}
			<Menu anchorEl={anchorEl} open={menuOpen} onClose={() => setMenuOpen(false)}>
				<MenuItem onClick={() => addRow('above')}>Insert row above</MenuItem>
				<MenuItem onClick={() => addRow('below')}>Insert row below</MenuItem>
			</Menu>
			{props.children}
		</td>
	);
}