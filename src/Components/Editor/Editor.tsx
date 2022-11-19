import { useState, useEffect, useMemo, useCallback, useRef } from "react";

import { DefaultFileContent } from "../../Constants";

import {
	focusOnEditor,
	getStorageItem,
	getTransitionElemClass,
} from "../../Utils";

import { createEditor, Range } from 'slate'
import { withHistory } from 'slate-history'
import { Slate, Editable, withReact } from 'slate-react'

import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Divider from '@mui/material/Divider';
import CodeIcon from '@mui/icons-material/Code';
import FormatBoldIcon from '@mui/icons-material/FormatBold';
import FormatItalicIcon from '@mui/icons-material/FormatItalic';
import FormatUnderlinedIcon from '@mui/icons-material/FormatUnderlined';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import FormatListNumberedIcon from '@mui/icons-material/FormatListNumbered';

import { ElementTypes } from "../../Types";
import EditorCommands from "./EditorCommands";
import EditorShortcuts from "./EditorShortcuts";
import { withImages, withHtml } from "./EditorPlugins";

import {
	Leaf,
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

import {
	MarkButton,
	BlockButton,
	LinkInsertButton,
	UploadImageButton,
	InsertTableButton,
} from "./EditorToolbar";

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
		() => withHtml(withImages(withHistory(withReact(createEditor()))))
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

export default MyEditor;