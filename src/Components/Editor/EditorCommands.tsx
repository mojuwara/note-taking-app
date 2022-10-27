import { ContainerElement, CustomEditor, ImageElement } from '../../Types';
import { Editor, Transforms, Element as SlateElement } from 'slate'


// Truen if the element exists just to wrap other elements(Ex with <ul>: <ul><li>...</li></ul>)
export const isWrappedType = (blk: string) => ["unorderedList", "orderedList"].includes(blk);

// Helper functions we can reuse
const EditorCommands = {
	insertImage(editor: CustomEditor, url: string) {
		// Delete currently selected node if it's empty
		Transforms.removeNodes(editor, {
			match: (n) => !Editor.isEditor(n) && SlateElement.isElement(n) && Editor.isEmpty(editor, n),
		});

		const image: ImageElement = { type: 'image', url, children: [{ text: '' }] };
		const imageContainer: ContainerElement = { type: 'container', children: [image]};
		Transforms.insertNodes(editor, imageContainer);

		if (editor.selection?.focus) {
			Transforms.select(editor, {path: editor.selection?.focus.path, offset: 1} );
		}
		console.log(editor.selection);
	},

	onElemType(editor: CustomEditor, type: string) {
		const matches = Array.from(Editor.nodes(editor, {
			match: (n) => !Editor.isEditor(n) && SlateElement.isElement(n) && n.type === type,
		}));
		return !!matches.length;
	},

	getElemType(editor: CustomEditor, type: string) {
		const matches = Array.from(Editor.nodes(editor, {
			match: (n) => !Editor.isEditor(n) && SlateElement.isElement(n) && n.type === type,
		}));
		return matches;
	},

	// Returns true if the given mark is active on the selected text
	isMarkActive(editor: CustomEditor, mark: string) {
		const marks: any = Editor.marks(editor);
		return marks ? marks[mark] === true : false;
	},

	// Toggles the given mark on/off
	toggleMark(editor: CustomEditor, mark: string) {
		const isActive = EditorCommands.isMarkActive(editor, mark);

		if (isActive)
			Editor.removeMark(editor, mark);
		else
			Editor.addMark(editor, mark, true);
	},

	// Returns true if the block type is active
	isBlockActive(editor: CustomEditor, block: string) {
		const match = Array.from(Editor.nodes(editor, {
			match: (n: any) => n.type === block,
		}));

		return !!match.length;
	},

	// Toggle the block on/off, 'paragraph' is the default block type
	// Elements are a type of Node that contian more Elements or Text Nodes
	toggleBlock(editor: CustomEditor, block: string) {
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

	unwrapNodes(editor: CustomEditor) {
		// Unwraps lists
		Transforms.unwrapNodes(editor, {
			match: n => (!Editor.isEditor(n) && SlateElement.isElement(n) && isWrappedType(n.type)),
			split: true,
		});
	}
};

export default EditorCommands;