import { CustomEditor, CustomElement } from '../../Types';
import EditorCommands from './EditorCommands';
import { Transforms } from 'slate';
import { deserialize } from './CopyPasteHelper';

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

export const withInlineLinks = (e: CustomEditor) => {
	const {isInline} = e;
	e.isInline = (elem: CustomElement) => {
		return elem.type === 'link' ? true : isInline(elem);
	}

	return e;
};

// For pasting html into the editor
export const withHtml = (e: CustomEditor) => {
	const {insertData} = e;

	e.insertData = (data: DataTransfer) => {
		const html = data.getData('text/html');
		if (!html) {
			insertData(data);
			return;
		}

		const parsed = new DOMParser().parseFromString(html, 'text/html');
		const fragment = deserialize(parsed.body)
		Transforms.insertFragment(e, fragment);
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