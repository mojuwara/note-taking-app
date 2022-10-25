import isUrl from 'is-url'

import { Transforms } from 'slate';

import { ImageExtensions } from '../../Constants';
import { CustomEditor, ImageElement } from '../../Types';

export const withImages = (e: CustomEditor): CustomEditor => {
	const insertImage = (url: string) => {
		const image: ImageElement = { type: 'image', url, children: [{ text: '' }] };
		// Transforms.insertNodes(e, { type: 'paragraph', children: [{ text: '' }] });
		Transforms.insertNodes(e, image);
		Transforms.insertNodes(e, { type: 'paragraph', children: [{ text: '' }] });
	}

	const isImageUrl = (s: string): boolean => {
		if (!isUrl(s))
			return false;

		const parts = s.split('.');
		return parts[parts.length - 1] in ImageExtensions;
	}

	const { isVoid, insertData } = e;

	e.isVoid = element => {
		return element.type === 'image' ? true : isVoid(element);
	}

	// e.isVoid = element => {
	// 	return element.type === 'image' ? true : isVoid(element);
	// }

	e.insertData = (data: DataTransfer) => {
		console.log(data);
		data.getData('text/plain')
		const text = data.getData('text/plain')

		// No files present
		if (!data.files || !data.files.length)
			return;

		for (let i = 0; i < data.files.length; i++) {
			const file = data.files[i];

			if (file.type.split('/')[0] === "image") {
				const reader = new FileReader()
				reader.addEventListener('load', () => {
					const url = reader.result as string;
					insertImage(url);
				})
				reader.readAsDataURL(file);
			} else if (isImageUrl(text)) {
				insertImage(text);
			} else {
				insertData(data)
			}
		}
	}

	return e;
}