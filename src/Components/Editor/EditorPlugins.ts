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

		console.log("html before", html);
		const parsed = new DOMParser().parseFromString(html, 'text/html');
		const fragment = deserialize(parsed.body);
		console.log("fragment after", fragment);

		Transforms.insertFragment(e, fragment);

		// If last element inserted was inline, the selection will be in the child elem
		// Move selection to after the child elem
		if (EditorCommands.onElemType(e, [ElementTypes.IMAGE, ElementTypes.LINK])) {
			const newLoc = EditorCommands.getLocAfterParent(e);
			if (newLoc)
				EditorCommands.updateSelectedElem(e, newLoc)
		}
	}
	return e;
}

// For pasting rich text content into the editor
// export const withRtf = (e: CustomEditor) => {
// 	const { insertData } = e;

// 	e.insertData = (data: DataTransfer) => {
// 		insertData(data);
// 	}

// 	return e;
// }