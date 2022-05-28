import { useState, useEffect, useMemo, useCallback } from "react";

import { host } from "../../Constants";
import { saveFileContents, getElemText } from "../../Utils";
import { CustomElement } from "../../Types";

import { createEditor, Editor, Transforms, Text, Element as SlateElement } from 'slate'
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

import EditorCommands from "./EditorCommands";

import {
	CodeBlockElement,
	DefaultBlockElement,
	ListItemBlockElement,
	BlockElementContainer,
	OrderedListBlockElement,
	UnorderedListBlockElement,
} from './BlockElements';

import axios from "axios";

const DefaultContent = [
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

	// How long to wait after the user stops making changes to save to server
	const saveInterval = 1000 * 3;

	// Timeout ID that triggers save to server
	const [timeoutID, setTimeoutID] = useState<NodeJS.Timer>();

	// Editor object
	const editor = useMemo(() => withReact(createEditor()), []);

	// Object where each key is the plain text in a block and its value is an array of strings
	const [suggestions, setSuggestions] = useState<any>({});

	const initialValue = useMemo(() => DefaultContent, []);

	// Load file from localStorage if available, else fetch from server and cache
	useEffect(() => {
		const initFileContents = async () => {
			const contents = localStorage.getItem(props.filePath);
			if (contents) {
				editor.children = JSON.parse(contents);
				editor.onChange();
				return;
			}

			try {
				const { data } = await axios.get<string>(`http://${host}/file_contents?filePath=${props.filePath}`);
				localStorage.setItem(props.filePath, data);

				editor.children = JSON.parse(data);
				editor.onChange();
			} catch (error) {
				console.error(error);
			}
		}

		initFileContents();
	}, [editor, props.filePath]);

	const handleKeyDown = (event: any) => {
		// 'split' option will break up the text node before applying the bold formatting
		if (event.key === 'b' && event.ctrlKey) {
			event.preventDefault();
			EditorCommands.toggleMark(editor, "bold");
		}
	}

	// Save editor contents if there were any text changes
	const handleEditorChange = (value: any) => {
		const isAstChange = editor.operations.some(
			op => 'set_selection' !== op.type
		)

		if (isAstChange) {
			const newContent = JSON.stringify(value);
			localStorage.setItem(props.filePath, newContent);

			// Clear old timeout and create a new timeout to save to server
			clearTimeout(timeoutID);
			setTimeoutID(setTimeout(() => {
				saveFileContents(props.filePath, newContent).then(response => setSuggestions(response));
			}, saveInterval));
		}
	}

	// Find suggestions, if any, for the given block element
	const getElemSuggestions = (element: CustomElement): string[] => {
		const text = getElemText(element);
		if (text in suggestions)
			return suggestions[text];

		return [];
	}

	const getBlockElement = (props: any) => {
		switch (props.element.type) {
			case 'code':
				return <CodeBlockElement {...props} />;
			case 'listItem':
				return <ListItemBlockElement {...props} />;
			case 'orderedList':
				return <OrderedListBlockElement {...props} />;
			case 'unorderedList':
				return <UnorderedListBlockElement {...props} />;
			default:
				return <DefaultBlockElement {...props} />;
		}
	}

	const renderElement = (props: any) => {
		let element = getBlockElement(props);

		const elemSuggestions = getElemSuggestions(props.element);
		return <BlockElementContainer element={element} suggestions={elemSuggestions} />
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

export default MyEditor;