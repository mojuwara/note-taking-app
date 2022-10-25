import { useState } from 'react';

import Popper from '@mui/material/Popper';

import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import { getElemText } from '../../Utils';
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
	return (
		<p {...props.attributes} style={{margin: 4, display: 'inline-block'}}>{props.children}</p>
	);
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

export const ImageBlockElement = (props: any) => {
	const selected = useSelected();
	const focused = useFocused();
	return (
		<div {...props.attributes}>
			{props.children}
			<div contentEditable={false}>
				<img style={{
					display: 'block',
					maxWidth: '100%',
					maxHeight: '20em',
					marginTop: 1,
					marginBottom: 1,
					boxShadow: selected && focused ? '0 0 0 3px #B4D5FF' : 'none',
				}} alt={props.url} src={props.element.url} />
			</div>
		</div>
	)
}

export const AnchorBlockElement = (props: any) => {
	const url = getElemText(props.element);
	return (
		<a href={url} {...props.attributes}>
			{props.children}
		</a>
	);
}