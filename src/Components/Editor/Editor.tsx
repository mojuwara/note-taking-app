import { useState, useEffect, useMemo, useCallback } from "react";

import { host } from "../../Constants";
import { CustomElement, CustomText } from "../../Types";

import { createEditor, Descendant, Editor, Transforms, Text, Element as SlateElement } from 'slate'
import { Slate, Editable, withReact } from 'slate-react'

import Toolbar from '@mui/material/Toolbar';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton'

import CodeIcon from '@mui/icons-material/Code';
import FormatBoldIcon from '@mui/icons-material/FormatBold';
import FormatItalicIcon from '@mui/icons-material/FormatItalic';
import FormatUnderlinedIcon from '@mui/icons-material/FormatUnderlined';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import FormatListNumberedIcon from '@mui/icons-material/FormatListNumbered';

import axios from "axios";

const DefaultContent: CustomElement[] = [
	{ type: "paragraph", children: [{ text: "" }] }
];

function MyEditor(props: any) {
	/*
	Slate text-editor
		Context provider: Keeps track of editor, plugins, values, selection and changes
			Must be rendered above and Editable components
			Can provide state to toolbars, menus, etc. via useSlate hook

		If you want to update the editor's content in response to events from
		outside of slate, you need to change the children property directly.
		The simplest way is to replace the value of editor.children
		editor.children = newValue and trigger a re-rendering (e.g. by calling
		editor.onChange() in the example above). Alternatively, you can use
		slate's internal operations to transform the value, for example:
	*/

	const saveInterval = 1000 * 3;
	const [timeoutID, setTimeoutID] = useState<NodeJS.Timer>();
	const editor = useMemo(() => withReact(createEditor()), []);

	const [suggestions, setSuggestions] = useState<any>({});

	// Fetch the initial value from localstorage
	const initialValue: Descendant[] = useMemo(() => DefaultContent, []);

	useEffect(() => {
		// Load file from localStorage if available, else fetch from server
		const initFileContents = async () => {
			const contents = localStorage.getItem(props.filePath);
			if (contents) {
				editor.children = JSON.parse(contents);
				editor.onChange();
			} else {
				try {
					// Receive data as a string so we don't have to stringify it for localStorage and parse again
					const { data } = await axios.get<string>(`http://${host}/file_contents?filePath=${props.filePath}`);
					localStorage.setItem(props.filePath, data);

					editor.children = JSON.parse(data);
					editor.onChange();
				} catch (error) {
					console.error(error);
				}
			}

		}

		initFileContents();
	}, [editor, props.filePath]);

	const handleKeyDown = (event: any) => {
		if (event.key === '&') {
			event.preventDefault();		// Prevent & from being inserted
			editor.insertText('and');
		}

		if (event.key === '`' && event.ctrlKey) {
			event.preventDefault();
			// EditorCommands.toggleCodeBlock(editor);
		}

		// 'split' option will break up the text node before applying the bold formatting
		if (event.key === 'b' && event.ctrlKey) {
			event.preventDefault();
			// EditorCommands.toggleBoldMark(editor);
		}
	}

	// Save editor contents
	const handleEditorChange = (value: any) => {
		// Find out if any content has changed
		const isAstChange = editor.operations.some(
			op => 'set_selection' !== op.type
		)

		// Always save changes to localStorage
		if (isAstChange) {
			const newContent = JSON.stringify(value)
			localStorage.setItem(props.filePath, newContent);

			// Save contents to server if changes are made and left idle for 3 seconds
			clearTimeout(timeoutID);
			setTimeoutID(setTimeout(() => {
				saveFileContents(props.filePath, newContent)
					.then(response => {
						console.log("Setting suggestions to", response);
						setSuggestions(response);
					})
			}, saveInterval));
		}
	}

	// useEffect(() => editor.onChange(), [suggestions, editor]);

	// Send file contents to server
	const saveFileContents = async (filePath: string, contents: string) => {
		try {
			const headers = { Accept: "application/json" };
			const { data } = await axios.put<any>(`http://${host}/file_contents`, { filePath: filePath, contents: contents }, { headers: headers });
			return data;
		} catch (error) {
			console.error(error);
			return []
		}
	}

	const getElemSuggestions = (element: CustomElement): string[] => {
		const text = getElemText(element);
		console.log("Suggestions", suggestions)
		console.log("Text", text)
		if (text in suggestions)
			return suggestions[text];

		return []
	}

	const getElemText = (element: CustomElement | CustomText): string => {
		if ("text" in element)
			return element["text"];

		return element.children.map((child: any) => getElemText(child)).join("");
	}

	const renderElement = (props: any) => {
		let element: JSX.Element;
		switch (props.element.type) {
			case 'code':
				element = <CodeBlockElement {...props} />;
				break;
			case 'listItem':
				element = <ListItemBlockElement {...props} />;
				break;
			case 'orderedList':
				element = <OrderedListBlockElement {...props} />;
				break;
			case 'unorderedList':
				element = <UnorderedListBlockElement {...props} />;
				break;
			default:
				element = <DefaultBlockElement {...props} />;
		}

		const elemSuggestions = getElemSuggestions(props.element)
		return (
			<div style={{ borderBottom: "solid" }}>
				<div style={{ width: '80%', display: 'inline-block' }}>{element}</div>

				{elemSuggestions.length > 0 &&
					<div style={{ width: '20%', border: 'solid', display: 'inline-block', position: 'absolute' }}>
						{elemSuggestions.map((val, ndx) => <p key={ndx}>{val}<br /></p>)}
					</div>}
			</div>
		);
	};

	const renderLeaf = useCallback((props: any) => <Leaf {...props} />, []);

	const style = {
		width: '100%',
		minHeight: '500px',
		height: '100%',
		border: 'solid',
	}

	return (
		<div style={style}>
			<Slate editor={editor} value={initialValue} onChange={handleEditorChange}>
				<Toolbar>
					<MarkButton editor={editor} mark="bold" icon={<FormatBoldIcon />} label="bold" />
					<MarkButton editor={editor} mark="italic" icon={<FormatItalicIcon />} label="italic" />
					<MarkButton editor={editor} mark="underline" icon={<FormatUnderlinedIcon />} label="underline" />
					<BlockButton editor={editor} block="code" icon={<CodeIcon />} label="code" />
					<BlockButton editor={editor} block="orderedList" icon={<FormatListNumberedIcon />} label="orderedList" />
					<BlockButton editor={editor} block="unorderedList" icon={<FormatListBulletedIcon />} label="unorderedList" />
				</Toolbar>
				<Divider />
				<Editable
					autoFocus
					renderLeaf={renderLeaf}
					onKeyDown={handleKeyDown}
					renderElement={renderElement} />
			</Slate>
		</div>
	);
}

const MarkButton = (props: any) => {
	const { editor, mark, label, icon } = props;
	const [active, setActive] = useState(EditorCommands.isMarkActive(editor, mark));

	const handleClick = () => {
		setActive(!active);
		EditorCommands.toggleMark(editor, mark);
	}

	return (
		<IconButton aria-label={label} onClick={handleClick}>
			{icon}
		</IconButton>
	)
}

const BlockButton = (props: any) => {
	const { editor, block, label, icon } = props;
	const [active, setActive] = useState(EditorCommands.isBlockActive(editor, block));

	const handleClick = () => {
		setActive(!active);
		EditorCommands.toggleBlock(editor, block);
	}

	return (
		<IconButton aria-label={label} onClick={handleClick}>
			{icon}
		</IconButton>
	)
}

// Element renderers
const DefaultBlockElement = (props: any) => {
	return (
		<p {...props.attributes}>{props.children}</p>
	);
}

const CodeBlockElement = (props: any) => {
	return (
		// props.attributes contains attrs that should be rendered at top-most elem of your block
		// props.children contains the leaves, the text nodes
		<pre {...props.attributes}>
			<code>{props.children}</code>
		</pre>
	);
}

const OrderedListBlockElement = (props: any) => {
	return (
		<ol {...props.attributes}>
			{props.children}
		</ol>
	);
}

const UnorderedListBlockElement = (props: any) => {
	return (
		<ul {...props.attributes}>
			{props.children}
		</ul>
	);
}

const ListItemBlockElement = (props: any) => {
	return (
		<li {...props.attributes}>
			{props.children}
		</li>
	);
}

// Tell Slate how to render leaves/text for custom formatting
const Leaf = (props: any) => {
	const style = {
		fontWeight: (props.leaf.bold) ? 'bold' : 'normal',
		fontStyle: (props.leaf.italic) ? 'italic' : 'normal',
		textDecoration: (props.leaf.underline) ? 'underline' : 'none'
	}

	return (
		<span {...props.attributes} style={style}>{props.children}</span>
	);
}

// Truen if the element exists just to wrap other elements(Ex with <ul>: <ul><li>...</li></ul>)
const isWrappedType = (blk: string) => ["unorderedList", "orderedList"].includes(blk);

// Helper functions we can reuse
const EditorCommands = {
	// Returns true if the given mark is active on the selected text
	isMarkActive(editor: any, mark: string) {
		const match = Array.from(Editor.nodes(editor, {
			match: (n: any) => n[mark] === true,
			universal: true,
		}));

		return !!match.length;
	},

	// Toggles the given mark on/off
	toggleMark(editor: any, mark: string) {
		const isActive = EditorCommands.isMarkActive(editor, mark);
		const properties: TextProperties = {};
		properties[mark] = !isActive;
		Transforms.setNodes(
			editor,
			properties,
			{ match: n => Text.isText(n), split: true }
		);
	},

	// Returns true if the block type is active
	isBlockActive(editor: any, block: string) {
		const match = Array.from(Editor.nodes(editor, {
			match: (n: any) => n.type === block,
		}));

		return !!match.length;
	},

	// Toggle the block on/off, 'paragraph' is the default block type
	// Elements are a type of Node that contian more Elements or Text Nodes
	toggleBlock(editor: any, block: string) {
		// Unwrap list elements, set them to 'list-item' type, then wrap them inside the list item type
		const isActive = EditorCommands.isBlockActive(editor, block);
		if (isWrappedType(block)) {
			if (!isActive) {
				// Remove the current block type the nodes are in, if its a listItem
				EditorCommands.unwrapNodes(editor);

				// Set their type to listItem
				Transforms.setNodes<SlateElement>(editor, { type: 'listItem' });

				// Wrap them inside the given list type
				Transforms.wrapNodes(editor, { type: block, children: [] });
			} else {
				// Set their type back to paragraph
				Transforms.setNodes<SlateElement>(editor, { type: 'paragraph' });

				// Remove the <ol> or <ul> type that was wrapping them
				EditorCommands.unwrapNodes(editor);
			}
			return;
		};

		// In case the nodes are already wrapped in a <ul> or <ol>
		EditorCommands.unwrapNodes(editor)

		Transforms.setNodes(
			editor,
			{ type: isActive ? 'paragraph' : block },
			{ match: n => Editor.isBlock(editor, n) }
		);
	},

	unwrapNodes(editor: any) {
		// Unwraps lists
		Transforms.unwrapNodes(editor, {
			match: n => (!Editor.isEditor(n) && SlateElement.isElement(n) && isWrappedType(n.type)),
			split: true,
		});
	}
};

// To make TypeScript happy, all marks will have a bool value
interface TextProperties {
	[index: string]: boolean;
}

export default MyEditor;