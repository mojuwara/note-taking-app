import { Editor, Transforms, Text, Element as SlateElement } from 'slate'

// Truen if the element exists just to wrap other elements(Ex with <ul>: <ul><li>...</li></ul>)
export const isWrappedType = (blk: string) => ["unorderedList", "orderedList"].includes(blk);

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

export default EditorCommands;