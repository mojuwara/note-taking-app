import { useState } from 'react';
import Popover from '@mui/material/Popover';

// Contains the actual block elements
export const BlockElementContainer = ({ element, suggestions }: any) => {
	const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

	const handleMouseEnter = (e: any) => setAnchorEl(e.currentTarget);

	const handleMouseLeave = (e: any) => setAnchorEl(null);

	const popover = (
		<Popover
			anchorEl={anchorEl}
			open={Boolean(anchorEl)}
			onClose={handleMouseLeave}
			sx={{ pointerEvents: 'none', margin: "2px" }}
			anchorOrigin={{ vertical: 'center', horizontal: 'right' }}
			transformOrigin={{ vertical: 'center', horizontal: 'left' }}
		>
			{suggestions.map((val: any, ndx: any) => <p key={ndx} style={{padding: 2}}>{val}</p>)}
		</Popover>
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
		<p {...props.attributes} style={{margin: 4}}>{props.children}</p>
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