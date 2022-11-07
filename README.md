# Feature Set
- Create folders
- Create files
- Make text **bold**, *italic* and/or underlined
- Insert ordered and unordered lists
- Copy/Paste images
- Insert images from computer
- Insert hyperlinks
- Insert tables

# Slatejs Concepts
#### Nodes
- `Editor` node is root-level and contains the entire documents contents
	- `interface Editor { children: Node[], ... }`
	- Editor instance methods to override behavior: https://docs.slatejs.org/api/nodes/editor#schema-specific-instance-methods-to-override
	- Editor helper methods: https://docs.slatejs.org/api/nodes/editor#static-methods
	- HTML DOM: https://developer.mozilla.org/en-US/docs/Web/API/Document
- `Element` container nodes carry semantic meaning
	- `interface Element { children: Node[] }`
	- Elements must have a `children` field, but you can add custom fields
	- All elements default to `block` elements, override this via `editor.isInline`
	- A block element cannot have an inline node as it's first or last child
	- A block element cannot have inline children nodes that are adjacent
	- Elements default to being `non-void`, their children are editable
	- Voidness can be overridden via `editor.isVoid`
	- Block-level elements: https://developer.mozilla.org/en-US/docs/Web/HTML/Block-level_elements
	- Inline elements: https://developer.mozilla.org/en-US/docs/Web/HTML/Inline_elements
- `Text` leaf-level nodes that contain the document text
	- `interface Text { text: string }`
	- Text nodes contain text content and any formatting
	- Text nodes: https://developer.mozilla.org/en-US/docs/Web/API/Text
#### Locations
- Locations allow you to specify places in the doc when inserting, deleting, etc.
- `Path` is an array of numbers, specifying the index of each of it's ancestor nodes
	- `type Path = number[]`
	- Ex: Editor path is [], Path of first node in the doc is [0]
- `Points` contain a path and an offset to a specific text node
	- We can think of them as cursors/carets
	- `interface Point { path: Path, offset: number }`
	- Ex: First place we can have our cursor in the first node is Point { path: [0], offset: 0 }
- `Range` refers to a span of content between two points(always leaf-level nodes)
	- `interface Range { anchor: Point, focus: Point }`
	- Anchor is where the user begins a selection and anchor is where the user ends the selection
		- Anchor can be before/after focus depending on if range is forwards or backwards
- `Selection` is a range that is stored at the root-level editor
#### Transforms
- `Transform` functions allow you to change the editors values
	- Transforms API: https://docs.slatejs.org/api/transforms
	- Ex: Flattening a list, moving a cursor, updating selection, insert text, delete a range, move nodes, insert nodes, etc.
	- Transforms usually act on the user's current selection, can be overridden with the `at` option
		- The `at` option can be a Path, Point or Range
		- Each will give a slightly different transformation
	- The `match` option can be used to restrict which nodes the transformation will apply to
		- Also gives a reference to the nodes `.parent` and `.children`
	- Use `Editor.nodes` to get an iterator of node entries for debugging/non-standard operations
#### Operations
- TODO: Collaborative editing
#### Commands
- `Commands` are functions on the `Editor` interface that will perform some action on the user's current selection
	- Commands will often make use of the `Transforms` API


## Roadmap
- DONE - Add functionality to the text editor(Ex: bolding, underline, etc.)
- DONE - Add a toolbar to the text editor
- DONE - Add keyboard shortcuts to the text editor
- DONE - Refactor code, split component into different files and add type annotations
- DONE - Figure out how to highlight text in the text editor and add questions on right-hand side
- DONE - Highlight the selected folder and the selected file
- DONE - Put name of the application in toolbar center
- DONE - Refactor keeping track of the current file
- DONE - Ensure file DNE before creating
- DONE - Add new file to localStorage on file create
- DONE - Ensure folder DNE
- DONE - Creating a file when there are no folder's yet("unfiled notes" folder)
- DONE - Expand folder if selected
- DONE - Support images/videos/links/tables in notes
- DONE - Enter while image is selected should create new block
- DONE - Fix image getting deleted when backspace on empty line below
- DONE - Store directory in localStorage
- DONE - Keep track of last opened file in localStorage
- DONE - Backspace on empty node while block is active toggles the block off
- DONE - Folder IDs should be generated in frontend
- DONE - Support 'tab' button in editor focus
- TODO - 'Tab' on ordered/unordered list should indent list
- TODO - Support copy/paste
- TODO - Support TODO lists in notes
- TODO - Sort files by last date modified?
- TODO - Keyboard shortcut to hide Drawer
- TODO - Display placeholder image when no file is selected
- TODO - Support 2 levels of folders (FolderA/FolderB/file)
- TODO - Autofocus on file creation popup(Works on Safari, not Firefox?)
- TODO - Align toolbar items vertically
- TODO - Lint config for code-style(double-quotes, semi-colons, etc.)
- TODO - Display selected file name somewhere?
- TODO - Place divider between mark icons and block icons?
- TODO -  Keyboard shortcut for new file and new folder
- TODO -  Delete files and folders, place files in a "Recently deleted" folder
- TODO - Keep track of time created, modified and opened for files
- TODO -  Drag/Drop to move files/folders
- TODO -  Rename files/folders
- TODO - Allow other users to read/write a file
- TODO - Backspace on first cell in an empty row that's not the first data row deletes that row
- TODO - Rate limiting

### AWS
- Authentication(Where is this stored? How to link data to logged-in user?)
- Storage (S3 for notes + metadata, DynamoDB for file struction)
- Function (Lambda backend to update S3 and DynamoDB)

- Files:
	- created, opened and modified fields:
		- created time is set when file is created, never after
		- opened time is updated whenever the file is opened in the editor
		- modified time is updated whenever a change is made to a files contents
	- selectedPath:
		- Can be a file or folder
		- Initially an "All files" folder is created and selected
		- When "Add file" is clicked:
			- If "All files" is selected: Creates a file in no folder
			- If a user-created folder is selected: Creates file within
			- If a file is selected: Creates file in containing folder or "All files"
			- Focus on new file
		- When "Add folder" is clicked:
			- If "All files" is selected: Creates top-level directory
			- If user-created folder is selected: Create child folder if not two levels down, create sibling folder otherwise
			- If file is selected, create folder in containing folder or "All files"
			- Focus on new folder and no selected file
		- If user folder is clicked and file within, focus on first file
		- If user file is clicked, focus on containing folder or "All files"

- Save mechanism:
	- Changes are saved to localStorage on each change
	- Changes are saved on the server 2 seconds after the users last change

- Text editor:
	- Images(Block)
	- Links(Inline)
	- Headers(h1, h2, h3)
	- Cursor not visible at the beginning of a new line
	- "* " at start becomes an unordered list
	- "1 " at start becomes an ordered list
	- Tab should insert 4 spaces
	- Find(and replace?)
	- Keep the marks(bold, italic, etc.) when you create a new line
	- Move popper to the top-center instead of right-center

- Study Buddy(Server):
	- Search Google for the answer/definition for some of the suggestions it has
	- Question generation:
		- Questgen
			- MCQ's, boolean questions, general FAQ
			- Only has questions that can be answered from the text
			- I want questions that have answers not found in the text
		-


- Stude Buddy(UI):
	- Remove a suggestion that's not helpful(Ex: Explain "What")
	- Use localstorage for suggestions