// import isUrl from 'is-url'

// import { ImageExtensions } from '../../Constants';
import { CustomEditor, CustomElement } from '../../Types';
import EditorCommands from './EditorCommands';

// Support drag-and-drop and copy-paste images
export const withImages = (e: CustomEditor): CustomEditor => {
	// const isImageUrl = (s: string): boolean => {
	// 	if (!isUrl(s))
	// 		return false;

	// 	const parts = s.split('.');
	// 	return parts[parts.length - 1] in ImageExtensions;
	// }

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

			if (file.type.split('/')[0] === "image") {
				const reader = new FileReader()
				reader.addEventListener('load', () => {
					const url = reader.result as string;
					EditorCommands.insertImage(e, url);
				})
				reader.readAsDataURL(file);
			} else {
				insertData(data)
			}
		}
	}

	return e;
};

export const withEnhance = (e: CustomEditor): CustomEditor => {
	// const { isInline } = e;
	// e.isInline = (elem: CustomElement) => {
	// 	const inlineElems = ['link'];
	// 	if (inlineElems.includes(elem.type))
	// 		return true;

	// 	return isInline(elem);
	// }
	return e;
}