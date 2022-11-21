import { Transforms, } from 'slate';
import EditorCommands from './EditorCommands';
import { deserialize } from './CopyPasteHelper';
import { CustomEditor, CustomElement, ElementTypes } from '../../Types';

// Support drag-and-drop and copy-paste images
export const withImages = (e: CustomEditor): CustomEditor => {
	const { isVoid, insertData, isInline } = e;

	e.isVoid = element => {
		return element.type === 'image' ? true : isVoid(element);
	}

	e.isInline = (elem: CustomElement) => {
		return elem.type === 'image' ? true : isInline(elem);
	}

	e.insertData = (data: DataTransfer) => {
		// No files present
		if (!data.files || !data.files.length)
			return;

		for (let i = 0; i < data.files.length; i++) {
			const file = data.files[i];

			if (file.type.split('/')[0] === "image")
				EditorCommands.insertImage(e, file);
			else
				insertData(data);
		}
	}

	return e;
};

// For pasting html into the editor
export const withHtml = (e: CustomEditor) => {
	const { insertData, isInline } = e;

	e.isInline = (elem: CustomElement) => {
		return ['link', 'image'].includes(elem.type) ? true : isInline(elem);
	}

	e.insertData = (data: DataTransfer) => {
		const html = data.getData('text/html');
		if (!html || !e.selection) {
			insertData(data);
			return;
		}

		// Create elements from pasted html and update selection
		const oldSel = e.selection;
		const parsed = new DOMParser().parseFromString(html, 'text/html');
		const fragment = deserialize(parsed.body);
		Transforms.insertFragment(e, fragment);
		EditorCommands.handleSelectionChange(e, oldSel);

		// If last element inserted was an inline, the selection will be in the child elem
		// Move selection to the text node after the inline elem
		if (EditorCommands.onElemType(e, [ElementTypes.IMAGE, ElementTypes.LINK])) {
			const newLoc = EditorCommands.getLocAfterParent(e);
			if (newLoc)
				EditorCommands.updateEditor(e, newLoc)
		}
	}
	return e;
}
