import { useMemo, useCallback, useState, useEffect } from 'react'

import { createEditor, Descendant, Editor, Transforms, Text, Element as SlateElement } from 'slate'
import { Slate, Editable, withReact } from 'slate-react'

import { styled, useTheme } from '@mui/material/styles';

import Box from '@mui/material/Box';
import AppBar from '@mui/material/AppBar';
import Drawer from '@mui/material/Drawer';
import Toolbar from '@mui/material/Toolbar';
import Divider from '@mui/material/Divider';
import MenuIcon from '@mui/icons-material/Menu';
import IconButton from '@mui/material/IconButton';
import NoteAddIcon from '@mui/icons-material/NoteAdd';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import CreateNewFolderIcon from '@mui/icons-material/CreateNewFolder';

import List from '@mui/material/List';
import Collapse from '@mui/material/Collapse';
import ListItemText from '@mui/material/ListItemText';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import ListItemButton from '@mui/material/ListItemButton';

import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';

import CodeIcon from '@mui/icons-material/Code';
import FormatBoldIcon from '@mui/icons-material/FormatBold';
import FormatItalicIcon from '@mui/icons-material/FormatItalic';
import FormatUnderlinedIcon from '@mui/icons-material/FormatUnderlined';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import FormatListNumberedIcon from '@mui/icons-material/FormatListNumbered';

import axios from 'axios';

import './App.css';

// This example is for an Editor with `ReactEditor` and `HistoryEditor`
import { BaseEditor } from 'slate'
import { ReactEditor } from 'slate-react'
import { HistoryEditor } from 'slate-history'

const host = "127.0.0.1:5000";
const FileSep: string = "/" ; // Single backslash

const DefaultContent: CustomElement[] = [
	{ type: "paragraph", children: [{ text: "" }] }
]

// const getFirstFile = (data: Folder[]): string => {
// 	// Make sure there are folders
// 	if (!data.length)
// 		return "";

// 	// Make sure there are files in the first folder
// 	const firstFolder = data[0];
// 	if (!firstFolder.files.length)
// 		return "";

// 	const firstFile = firstFolder.files[0];
// 	return [firstFolder.name, firstFile.name].join(FileSep);
// }

const getFirstFolder = (data: Folder[]): string => {
	// Make sure there are folders
	if (!data.length)
		return "";

	// Make sure there are files in the first folder
	return data[0].name;
}

const getFolderName = (path: string): string => {
	const [folderName] = path.split(FileSep);
	return folderName;
}

const getMaxId = (entries: Folder[] | File[]): number => {
	let max = -1;
	entries.forEach(f => {
		if (f.id > max)
			max = f.id;
	})
	return max;
}

// Limitations: File structure is only top-level folder containing files, no sub-folders
function App() {
	const [filePath, setFilePath] = useState("");	// "folder.file" format
	const [directory, setDirectory] = useState<Folder[]>([]);	// All the users files
	const [creatingFile, setCreatingFile] = useState(false);	// Creating a file
	const [creatingFolder, setCreatingFolder] = useState(false);	// Creating a folder

	const fetchFiles = async () => {
		try {
			const headers = { Accept: 'application/json' };
			const { data } = await axios.get<Folder[]>(`http://${host}/folders`, { headers: headers });
			setDirectory(data);
		} catch (error: any) {
			console.error(error.message)
		}
	}

	const postNewFolder = async (folderName: string) => {
		try {
			await axios.post(`http://${host}/folders`, {folderName: folderName});
		} catch (error) {
			console.error("Error while creating new file:", error)
		}
	}

	const postNewFile = async (folderName: string, fileName: string) => {
		try {
			await axios.post(`http://${host}/file`, { folderName: folderName, fileName: fileName });
		} catch (error) {
			console.error("Error while creating new file:", error)
		}
	}

	// Load the folders and file names on initial render
	useEffect(() => {
		fetchFiles();
	}, []);

	// Create new folder on the server, make local changes for user
	const handleFolderCreate = (folderName: string) => {
		postNewFolder(folderName);

		let dir = directory.slice();
		dir.push({
			id: getMaxId(directory) + 1,
			name: folderName,
			files: [],
		});

		setDirectory(dir);

		setCreatingFolder(false);
	}

	// Have server create new file, make local changes for user
	// TODO: Refactor keeping track of the current file
	const handleFileCreate = (fileName: string) => {
		let folderName = getFolderName(filePath);
		if (folderName === "")
			folderName = getFirstFolder(directory);

		postNewFile(folderName, fileName);

		let dir = directory.slice();
		dir.forEach(d => {
			if (d.name === folderName)
				d.files.push({
					id: getMaxId(d.files) + 1,
					"name": fileName,
					contents: [],
				});
		});

		setDirectory(dir);

		setCreatingFile(false);
	}

	return (
		<Box>
			<MyToolbar
				directory={directory}
				onFileClick={(newPath: string) => setFilePath(newPath) }
				onNewFile={() => setCreatingFile(true)}
				onNewFolder={() => setCreatingFolder(true)} />

			{filePath && <MyEditor filePath={filePath} />}

			{creatingFile && <CreateFileDialog
													onFileCreate={handleFileCreate}
													onClose={() => setCreatingFile(false)} />}
			{creatingFolder && <CreateFolderDialog
														onFolderCreate={handleFolderCreate}
														onClose={() => setCreatingFolder(false)} />}
		</Box>
  );
}

type Folder = {
	id: number;
	name: string;
	files: File[];
}

type File = {
	id: number;
	name: string;
	contents: CustomElement[]
}

const CreateFileDialog = (props: any) => {
	const [fileName, setFileName] = useState("");

	return (
		<div>
			<Dialog open={true} onClose={props.onClose}>
				<DialogTitle>Create New File</DialogTitle>
				<DialogContent>
					<TextField
						autoFocus
						margin="dense"
						id="name"
						label="File Name"
						fullWidth
						variant="standard"
						value={fileName}
						onChange={(event: any) => setFileName(event.target.value)}
					/>
				</DialogContent>
				<DialogActions>
					<Button onClick={props.onClose}>Cancel</Button>
					<Button onClick={() => props.onFileCreate(fileName)}>Create</Button>
				</DialogActions>
			</Dialog>
		</div>
	)
}

const CreateFolderDialog = (props: any) => {
	const [folderName, setFolderName] = useState("");

	return (
		<div>
			<Dialog open={true} onClose={props.onClose}>
				<DialogTitle>Create New Folder</DialogTitle>
				<DialogContent>
					<TextField
						autoFocus
						margin="dense"
						id="name"
						label="Folder Name"
						fullWidth
						variant="standard"
						value={folderName}
						onChange={(event: any) => setFolderName(event.target.value)}
					/>
				</DialogContent>
				<DialogActions>
					<Button onClick={props.onClose}>Cancel</Button>
					<Button onClick={() => props.onFolderCreate(folderName)}>Create</Button>
				</DialogActions>
			</Dialog>
		</div>
	)
}

const DrawerHeader = styled('div')(({ theme }) => ({
	display: 'flex',
	alignItems: 'center',
	padding: theme.spacing(0, 1),
	// necessary for content to be below app bar
	...theme.mixins.toolbar,
	justifyContent: 'start',
}));

const MyToolbar = (props: any) => {
	const theme = useTheme();
	const [open, setOpen] = useState(false);

	const handleDrawerOpen = () => setOpen(true);
	const handleDrawerClose = () => setOpen(false);

	const DrawerWidth = 240;
	const drawerStyle = {
		width: DrawerWidth,
		flexShrink: 0,
		'& .MuiDrawer-paper': {
			width: DrawerWidth,
			boxSizing: 'border-box',
		},
	}

	return (
		// <Box sx={{display: 'flex'}}>
		<>
			<AppBar position="sticky">
				<Toolbar>
					<IconButton
						color="inherit"
						aria-label="open drawer"
						onClick={handleDrawerOpen}
						edge="start"
						// sx={{ mr: 2, ...(open && { display: 'none' }) }}
					>
						<MenuIcon />
					</IconButton>
				</Toolbar>
			</AppBar>

			<Drawer sx={drawerStyle} variant="persistent" anchor="left" open={open}>
				<DrawerHeader>
					<IconButton onClick={props.onNewFolder}>
						<CreateNewFolderIcon />
					</IconButton>
					<IconButton onClick={props.onNewFile}>
						<NoteAddIcon />
					</IconButton>
					<IconButton onClick={handleDrawerClose}>
						{theme.direction === 'ltr' ? <ChevronLeftIcon /> : <ChevronRightIcon />}
					</IconButton>
				</DrawerHeader>
				<Divider />

				<List
					sx={{ width: '100%', maxWidth: DrawerWidth, bgcolor: 'background.paper' }}
					component="nav"
					>
					{props.directory.map((folder: Folder, ndx: any) => <FolderListItem key={ndx} folder={folder} onFileClick={props.onFileClick} />)}
				</List>
			</Drawer>
		</>
	);
}

const FolderListItem = (props: any) => {
	const [open, setOpen] = useState(false);

	return (
		<>
			<ListItemButton onClick={() => setOpen(!open)}>
				<ListItemText primary={props.folder.name} />
				{open ? <ExpandLess /> : <ExpandMore />}
			</ListItemButton>

			<Collapse in={open} timeout="auto" unmountOnExit>
				<List component="div" disablePadding>
					{props.folder.files.map((file: any, ndx: number) =>
						<FileListItem
						  key={ndx}
							file={file}
							folderName={props.folder.name}
							onFileClick={props.onFileClick} />)}
				</List>
			</Collapse>
		</>
	)
}

const FileListItem = (props: any) => {
	const filePath = [props.folderName, props.file.name].join(FileSep);
	return (
		<ListItemButton sx={{ pl: 4 }} onClick={() => props.onFileClick(filePath)}>
			<ListItemText primary={props.file.name} />
		</ListItemButton>
	)
}

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
					const {data} = await axios.get<string>(`http://${host}/file_contents?filePath=${props.filePath}`);
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
			const headers = {Accept: "application/json" };
			const { data } = await axios.put<any>(`http://${host}/file_contents`, { filePath: filePath, contents: contents }, {headers: headers});
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

	const getElemText = (element: CustomElement | CustomText): string=> {
		if ("text" in element)
			return element["text"];

		return element.children.map(child => getElemText(child)).join("");
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
			<div style={{borderBottom: "solid"}}>
				<div style={{width: '80%', display: 'inline-block'}}>{element}</div>

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
	const {editor, mark, label, icon} = props;
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
	const {editor, block, label, icon} = props;
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

// Custom types for Slate
type CustomText = { text: string; bold?: boolean, italic?: boolean, underline?: boolean }

type GenericElement = {type: string, children: CustomText[]}
type CodeElement = { type: 'code'; children: CustomText[] }
type ParagraphElement = { type: 'paragraph'; children: CustomText[] }
type CustomElement = GenericElement | ParagraphElement | CodeElement;

type CustomEditor = BaseEditor & ReactEditor & HistoryEditor;

// Nodes => Editor, Elements(defined above) and Text nodes
declare module 'slate' {
	interface CustomTypes {
		Text: CustomText
		Editor: CustomEditor
		Element: CustomElement
	}
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
				Transforms.setNodes<SlateElement>(editor, {type: 'listItem'});

				// Wrap them inside the given list type
				Transforms.wrapNodes(editor, {type: block, children: []});
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

export default App;