import { useState, useEffect, useMemo, useCallback, useRef } from "react";

import {
	DefaultFileContent
} from "../../Constants";
import {
	focusOnEditor,
	getStorageItem,
	getTransitionElemClass,
} from "../../Utils";

import { createEditor, Range } from 'slate'
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

import { ElementTypes } from "../../Types";
import EditorCommands from "./EditorCommands";
import EditorShortcuts from "./EditorShortcuts";
import { withImages, withInlineLinks, withHtml } from "./EditorPlugins";

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
	ParagraphBlockElement,
	TableBlockElement,
	TableHeadBlockElement,
	TableRowBlockElement,
	TableHeaderBlockElement,
	TableBodyBlockElement,
	TableDataBlockElement,
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

	// Used to keep track of the current selection
	const currSelection = useRef<Range | null>(null);

	// How long to wait after the user stops making changes to save to server
	const saveInterval = 1000 * 2;

	// Timeout ID that triggers save to server
	const [timeoutID, setTimeoutID] = useState<NodeJS.Timer>();

	// Editor object
	const editor = useMemo(
		() => withHtml(withInlineLinks(withImages(withHistory(withReact(createEditor())))))
	, []);

	const initialValue = useMemo(() => getStorageItem(props.filePath, DefaultFileContent)
	,	[props.filePath]);

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
		focusOnEditor();
		// TODO: Save file on file change
		return () => {

		}
	}, [editor, props.filePath]);

	const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
		console.log("Keydown")
		EditorShortcuts(editor, event);
	}

	const handleEditorChange = (value: any) => {
		if (editor.operations.every(op => 'set_selection' === op.type) && JSON.stringify(editor.selection) !== JSON.stringify(currSelection.current))
			EditorCommands.handleSelectionChange(editor, currSelection.current);
		currSelection.current = editor.selection;

		// Save editor contents if there were any text changes
		const isAstChange = editor.operations.some(op => 'set_selection' !== op.type);
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
			case ElementTypes.CODE:
				return <CodeBlockElement {...props} />;
			case ElementTypes.H1:
				return <H1BlockElement {...props} />;
			case ElementTypes.H2:
				return <H2BlockElement {...props} />;
			case ElementTypes.H3:
				return <H3BlockElement {...props} />;
			case ElementTypes.IMAGE:
				return <ImageBlockElement {...props} />;
			case ElementTypes.LINK:
				return <LinkBlockElement {...props} />;
			case ElementTypes.LIST_ITEM:
				return <ListItemBlockElement {...props} />;
			case ElementTypes.LIST_ORDERED:
				return <OrderedListBlockElement {...props} />;
			case ElementTypes.LIST_UNORDERED:
				return <UnorderedListBlockElement {...props} />;
			case ElementTypes.PARAGRAPH:
				return <ParagraphBlockElement {...props} />;
			case ElementTypes.TABLE:
				return <TableBlockElement {...props} />;
			case ElementTypes.TABLE_BODY:
				return <TableBodyBlockElement {...props} />;
			case ElementTypes.TABLE_DATA:
				return <TableDataBlockElement {...props} />;
			case ElementTypes.TABLE_HEAD:
				return <TableHeadBlockElement {...props} />;
			case ElementTypes.TABLE_HEADER:
				return <TableHeaderBlockElement {...props} />;
			case ElementTypes.TABLE_ROW:
				return <TableRowBlockElement {...props} />;
			default:
				return <DefaultBlockElement {...props} />;
		}
	}

	const renderElement = (props: any) => {
		return getBlockElement(props);
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
					<LinkInsertButton />
					<BlockButton block={ElementTypes.CODE} icon={<CodeIcon />} label="code" />
					<BlockButton block={ElementTypes.LIST_ORDERED} icon={<FormatListNumberedIcon />} label="orderedList" />
					<BlockButton block={ElementTypes.LIST_UNORDERED} icon={<FormatListBulletedIcon />} label="unorderedList" />
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

const MarkButton = (props: any) => {
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
					<TextField onClick={(e) => e.stopPropagation()} label={ElementTypes.LINK} variant="outlined" size="small" onChange={e => handleChange(e, setHref)} />
					<TextField onClick={(e) => e.stopPropagation()} label="Display" variant="outlined" size="small" onChange={e => handleChange(e, setDisplayText)} />
					<Button variant="contained" onClick={handleCreateClick}>
						Create
					</Button>
				</Box>
			</Popper>
		</IconButton>
	);
}

const InsertTableButton = () => {
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
}

const BlockButton = (props: any) => {
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