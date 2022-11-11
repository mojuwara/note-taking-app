import { useState, useEffect, useMemo, useCallback } from "react";

import {
	// host,
	DefaultFileContent
} from "../../Constants";
import {
	getStorageItem,
	// getElemText,
	getTransitionElemClass,
} from "../../Utils";

import { createEditor, Transforms } from 'slate'
import { Slate, Editable, withReact, useSlate } from 'slate-react'

import { withHistory } from 'slate-history'

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Toolbar from '@mui/material/Toolbar';
import Divider from '@mui/material/Divider';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton'

import CodeIcon from '@mui/icons-material/Code';
import FormatBoldIcon from '@mui/icons-material/FormatBold';
import FormatItalicIcon from '@mui/icons-material/FormatItalic';
import FormatUnderlinedIcon from '@mui/icons-material/FormatUnderlined';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import FormatListNumberedIcon from '@mui/icons-material/FormatListNumbered';
import TableRowsOutlinedIcon from '@mui/icons-material/TableRowsOutlined';
import ImageOutlinedIcon from '@mui/icons-material/ImageOutlined';
import InsertLinkOutlinedIcon from '@mui/icons-material/InsertLinkOutlined';
import Popper from '@mui/material/Popper';

import EditorCommands from "./EditorCommands";
import editorShortcuts from "./EditorShortcuts";
import { withImages, withInlineLinks } from "./EditorPlugins";

import {
	H1BlockElement,
	H2BlockElement,
	H3BlockElement,
	CodeBlockElement,
	ImageBlockElement,
	DefaultBlockElement,
	ListItemBlockElement,
	OrderedListBlockElement,
	UnorderedListBlockElement,
	LinkBlockElement,
	ContainerBlockElement,
	ParagraphBlockElement,
	TableBlockElement,
	TableHeadBlockElement,
	TableRowBlockElement,
	TableHeaderBlockElement,
	TableBodyBlockElement,
	TableDataBlockElement,
	// TableContainerBlockElement,
} from './BlockElements';

// import axios from "axios";

import "./editor.css";
import '../../App.css';

type EditorProps = {
	filePath: string;
	drawerOpen: boolean;
}

function MyEditor(props: EditorProps) {
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
	const saveInterval = 1000 * 2;

	// Timeout ID that triggers save to server
	const [timeoutID, setTimeoutID] = useState<NodeJS.Timer>();

	// Editor object
	const editor = useMemo(() => withInlineLinks(withImages(withHistory(withReact(createEditor())))), []);

	// Object where each key is the plain text in a block and its value is an array of strings
	// const [suggestions, setSuggestions] = useState<any>({});

	const initialValue = useMemo(() => getStorageItem(props.filePath, DefaultFileContent)
	,	[props.filePath]);

	// TODO: Simplify logic
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
				// const { data } = await axios.get<string>(`http://${host}/file_contents?filePath=${props.filePath}`);
				const data = JSON.stringify(DefaultFileContent);
				localStorage.setItem(props.filePath, data);

				editor.children = JSON.parse(data);
				editor.onChange();
			} catch (error) {
				console.error(error);
			}
		}

		initFileContents();

		// TODO: Save file on file change
		return () => {

		}
	}, [editor, props.filePath]);

	const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
		editorShortcuts(editor, event);
	}

	// Save editor contents if there were any text changes
	// TODO: If table selected, overlay options to insert new row or column
	// TODO: Ability to inspect entire table
	const handleEditorChange = (value: any) => {
		// console.log("Change", value);

		// Add/Remove col/row that anchor is on if table is selected
		EditorCommands.updateTableSelection(editor);

		// console.log("Selection on change", , editor.selection?.anchor?.offset)
		const isAstChange = editor.operations.some(
			op => 'set_selection' !== op.type
		)

		if (isAstChange) {
			const newContent = JSON.stringify(value);
			localStorage.setItem(props.filePath, newContent);

			// Clear old timeout and create a new timeout to save to server
			clearTimeout(timeoutID);
			setTimeoutID(setTimeout(() => {
				// saveFileContents(props.filePath, newContent).then(response => setSuggestions(response));
			}, saveInterval));
		}
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
			case 'h1':
				return <H1BlockElement {...props} />;
			case 'h2':
				return <H2BlockElement {...props} />;
			case 'h3':
				return <H3BlockElement {...props} />;
			case 'image':
				return <ImageBlockElement {...props} />;
			case 'link':
				return <LinkBlockElement {...props} />;
			case 'container':
				return <ContainerBlockElement {...props} />;
			case 'paragraph':
				return <ParagraphBlockElement {...props} />;
			case 'table':
				return <TableBlockElement {...props} />;
			case 'table-head':
				return <TableHeadBlockElement {...props} />;
			case 'table-row':
				return <TableRowBlockElement {...props} />;
			case 'table-header':
				return <TableHeaderBlockElement {...props} />;
			case 'table-body':
				return <TableBodyBlockElement {...props} />;
			case 'table-data':
				return <TableDataBlockElement {...props} />;
			default:
				return <DefaultBlockElement {...props} />;
		}
	}

	const renderElement = (props: any) => {
		let element = getBlockElement(props);
		return element;
		// const elemSuggestions = getElemSuggestions(props.element);
		// return <BlockElementContainer element={element} suggestions={elemSuggestions} />
	};

	const renderLeaf = useCallback((props: any) => <Leaf {...props} />, []);

	console.log(editor.children);
	console.log(editor.selection);

	return (
		<Box className={getTransitionElemClass(props.drawerOpen)} sx={{ flex: '1' }}>
			<Slate editor={editor} value={initialValue} onChange={handleEditorChange}>
				<Toolbar variant="dense" sx={{justifyContent: "center"}}>
					<MarkButton mark="bold" icon={<FormatBoldIcon />} label="bold" />
					<MarkButton mark="italic" icon={<FormatItalicIcon />} label="italic" />
					<MarkButton mark="underline" icon={<FormatUnderlinedIcon />} label="underline" />
					<LinkInsertButton />	{/* Popup, not block element */}
					<BlockButton block="code" icon={<CodeIcon />} label="code" />
					{/* <Divider orientation="vertical" flexItem /> */}
					<BlockButton block="orderedList" icon={<FormatListNumberedIcon />} label="orderedList" />
					<BlockButton block="unorderedList" icon={<FormatListBulletedIcon />} label="unorderedList" />
					<InsertTableButton />
					<UploadImageButton />
				</Toolbar>
				<Divider />
				<Editable
					id="editorComponent"
					autoFocus
					spellCheck
					className="textEditor"
					renderLeaf={renderLeaf}
					onKeyDown={handleKeyDown}
					renderElement={renderElement} />
			</Slate>
		</Box>
	);
}

const focusOnEditor = () => {
	const elem: HTMLElement | null = document.querySelector("#editorComponent");
	if (!elem)
		return;
	elem.focus();
}

const MarkButton = (props: any) => {
	const editor = useSlate();
	const { mark, label, icon } = props;

	const handleClick = (e: any) => {
		e.preventDefault();
		EditorCommands.toggleMark(editor, mark);
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
}

const UploadImageButton = () => {
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
}

const LinkInsertButton = (props: any) => {
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
	// TODO: Cmd + click should open link if link is selected, override editor.insertText
	// TODO: Links should be inline-block
	// TODO: Pressing enter at link-end creates a new link
	return (
		<IconButton aria-label={"Insert link"} onClick={(e) => handleClick(e)}>
			<InsertLinkOutlinedIcon />
			<Popper open={open} anchorEl={anchorEl}>
				<Box sx={{ border: 1, p: 1, bgcolor: 'background.paper' }}>
					<TextField onClick={(e) => e.stopPropagation()} label="Link" variant="outlined" size="small" onChange={e => handleChange(e, setHref)} />
					<TextField onClick={(e) => e.stopPropagation()} label="Display" variant="outlined" size="small" onChange={e => handleChange(e, setDisplayText)} />
					<Button variant="contained" onClick={handleCreateClick}>
						Create
					</Button>
				</Box>
			</Popper>
		</IconButton>
	);
}

// TODO: Space outside table to allow for adding new
const InsertTableButton = (props: any) => {
	const editor = useSlate();
	return (
		<IconButton aria-label={"Insert link"} onClick={(e) => EditorCommands.insertTable(editor)}>
			<TableRowsOutlinedIcon />
		</IconButton>
	)
}

const BlockButton = (props: any) => {
	const editor = useSlate();
	const { block, label, icon } = props;

	const handleClick = (e: any) => {
		e.preventDefault();
		EditorCommands.toggleBlock(editor, block);
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