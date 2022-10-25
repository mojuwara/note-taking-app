### Feature Set
- Create folders
- Create files
- Make text **bold**, *italic* and/or underlined
- Insert ordered and unordered lists
- Copy/Paste images

### Roadmap
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
- TODO - Support images/videos/links/tables in notes
- TODO - Support copy/paste
- TODO - Store directory in localStorage
- TODO - Keep track of last opened file in localStorage
- TODO - Sort files by last date modified?
- TODO - Keyboard shortcut to hide Drawer
- TODO - Display placeholder image when no file is selected
- TODO - Support 2 levels of folders (FolderA/FolderB/file)
- TODO - Folder IDs should be generated in backend
- TODO - Autofocus on file creation popup(Works on Safari, not Firefox?)
- TODO - Align toolbar items vertically
- TODO - Lint config for styling(double-quotes, semi-colons, etc.)
- TODO - Display selected file name somewhere
- TODO - Support 'tab' button in editor focus
- TODO - Place divider between mark icons and block icons
- TODO -  Keyboard shortcut for new file and new folder?
- TODO -  Delete files and folders
- TODO -  Drag/Drop to move files/folders
- TODO -  Rename files/folders

- Files:
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