import { useState, useEffect, useMemo, useCallback, useRef } from "react";

import { Storage } from 'aws-amplify';

import { DefaultFileContent } from "../../Constants";

import {
	focusOnEditor,
	getStorageItem,
	getTransitionElemClass,
	storeFileContent,
} from "../../Utils";

import { createEditor, NodeEntry, Range, Node as SlateNode, Text } from 'slate'
import { withHistory } from 'slate-history'
import { Slate, Editable, withReact, RenderElementProps } from 'slate-react'

import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Divider from '@mui/material/Divider';
import CodeIcon from '@mui/icons-material/Code';
import FormatBoldIcon from '@mui/icons-material/FormatBold';
import FormatItalicIcon from '@mui/icons-material/FormatItalic';
import FormatUnderlinedIcon from '@mui/icons-material/FormatUnderlined';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import FormatListNumberedIcon from '@mui/icons-material/FormatListNumbered';

import { ElementTypes, RangeDecoration } from "../../Types";
import EditorCommands from "./EditorCommands";
import EditorShortcuts from "./EditorShortcuts";
import { withImages, withHtml } from "./EditorPlugins";

import { Leaf } from './EditorLeaf';

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
import { CommonWords } from "../../words";

type EditorProps = {
	user: any;
	filePath: string;
	drawerOpen: boolean;
}

function MyEditor(props: EditorProps) {
	// Used to keep track of the current selection in the editor
	const currSelection = useRef<Range | null>(null);

	// If the user stops typing for this many ms, the file will be saved in S3
	const saveInterval = 1000 * 2;

	// Timeout ID that triggers save to server
	const [timeoutID, setTimeoutID] = useState<NodeJS.Timer>();

	// Editor object
	const editor = useMemo(() => withHtml(withImages(withHistory(withReact(createEditor()))))
	, []);

	const initialValue = useMemo(() => getStorageItem(props.filePath, DefaultFileContent)
	,	[props.filePath]);

	// Load file from localStorage if available, else fetch from server and cache
	useEffect(() => {
		const initFileContents = async () => {
			// Display any contents in localStorage first
			const contents = localStorage.getItem(props.filePath);
			if (contents) {
				editor.children = JSON.parse(contents);
				editor.onChange();
				return;
			}

			try {
				const response = await Storage.get(`${props.user.username}/${props.filePath}`, {download: true, contentType: "application/json", level: "private"});
				if (!response) {
					console.log("Unable to load file contents");
					return;
				}
				const blob = response.Body as Blob;
				const fileContents = JSON.parse(await blob.text());
				console.log("File contents from S3", fileContents);
				localStorage.setItem(props.filePath, JSON.stringify(fileContents));

				editor.children = fileContents;
				editor.onChange();
			} catch (error) {
				console.error(error);
			}
		}

		initFileContents();
		focusOnEditor();

		// Only store file contents if file was modified
		return () => { storeFileContent(`${props.user.username}/${props.filePath}`, editor.children); }
	}, [editor, props.filePath, props.user]);

	const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
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

	const getBlockElement = (props: RenderElementProps) => {
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

	const renderElement = (props: RenderElementProps) => {
		return getBlockElement(props);
	};

	const decorate = (entry: NodeEntry<SlateNode>): RangeDecoration[] => {
		const [node, path] = entry;
		const ranges: RangeDecoration[] = [];
		if (!Text.isText(node))
			return ranges;

		// TODO: Account for phrases
		let offset = 0;
		for (const word of node.text.split(' ')) {
			if (!CommonWords.has(word))
				ranges.push({
					isUncommonWord: true,
					anchor: {path, offset},
					focus: {path, offset: offset + word.length}
				});
			offset += word.length + 1;	// +1 for the space in the string
		}
		return ranges;
	}

	const renderLeaf = useCallback((props: any) => <Leaf {...props} />, []);

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
					decorate={decorate}
					className="textEditor"
					renderLeaf={renderLeaf}
					onKeyDown={handleKeyDown}
					renderElement={renderElement} />
			</Slate>
		</Box>
	);
}

export default MyEditor;