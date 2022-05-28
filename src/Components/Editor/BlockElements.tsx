// Contains the actual block elements
export const BlockElementContainer = ({ element, suggestions }: any) => {
	const makeSuggestions = () => {
		return (
			suggestions.length > 0 &&
			<div style={{ width: '20%', border: 'solid', display: 'inline-block', position: 'absolute' }}>
				{suggestions.map((val: string, ndx: number) => (
					<p key={ndx}>
						{val}
						<br />
					</p>
				))}
			</div>
		);
	}

	return (
		<div style={{ borderBottom: "solid" }}>
			<div style={{ width: '80%', display: 'inline-block' }}>{element}</div>
			{makeSuggestions()}
		</div>
	);
}

// Element renderers
export const DefaultBlockElement = (props: any) => {
	return (
		<p {...props.attributes}>{props.children}</p>
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