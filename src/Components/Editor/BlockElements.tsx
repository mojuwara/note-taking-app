import { useState } from 'react';

import Popper from '@mui/material/Popper';

import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
// import { getElemText } from '../../Utils';
import { useSelected,	useFocused } from 'slate-react';

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
	return <p {...props.attributes}>{props.children}</p>;
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
		<ol {...props.attributes}>
			{props.children}
		</ol>
	);
}

export const UnorderedListBlockElement = (props: any) => {
	return (
		<ul {...props.attributes}>
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

export const TableBlockElement = (props: any) => {
	return (
		<table
			border={1}
			{...props.attributes}
			style={{borderCollapse: "collapse"}}
		>
			{props.children}
		</table>);
}

export const TableHeadBlockElement = (props: any) => {
	return <thead {...props.attributes}>{props.children}</thead>;
}

export const TableRowBlockElement = (props: any) => {
	return <tr {...props.attributes}>{props.children}</tr>;
}

export const TableHeaderBlockElement = (props: any) => {
	return <th style={{minHeight: 24, minWidth: 64}} {...props.attributes}>{props.children}</th>;
}

export const TableBodyBlockElement = (props: any) => {
	return <tbody {...props.attributes}>{props.children}</tbody>;
}

export const TableDataBlockElement = (props: any) => {
	return <td style={{ minHeight: 24, minWidth: 64 }} {...props.attributes}>{props.children}</td>;
}