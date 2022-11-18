import { Node as SlateNode } from "slate";
import { CustomText, ElementTypes, ImageElement, LinkElement } from "../../Types";

// Recursively build node tree
export const deserialize = (elem: Node): SlateNode[] => {
	if (elem.nodeType === Node.TEXT_NODE && elem.textContent) {
		return [{text: elem.textContent}];
	} else if (elem.nodeType !== Node.ELEMENT_NODE) {
		return [];
	}

	console.log("deserializing", elem, elem.nodeName)
	let children: SlateNode[] = Array.from(elem.childNodes)
		.map(node => deserialize(node))
		.flat();

	if (children.length === 0)
		children = [{ text: '' }];

	let typedChildren;
	switch (elem.nodeName) {
		case "BODY":
			return children;
		case "P":
			typedChildren = children as (CustomText | LinkElement | ImageElement)[];
			return [{ type: ElementTypes.PARAGRAPH, children: typedChildren }];

		// TEXT
		case "I":
			typedChildren = children as CustomText[];
			return [{ italic: true, ...combineAttrs(typedChildren) }];
		case "B":
			typedChildren = children as CustomText[];
			return [{ bold: true, ...combineAttrs(typedChildren) }];
		case "U":
			typedChildren = children as CustomText[];
			return [{ underline: true, ...combineAttrs(typedChildren) }];
	}

	return children;
}

const combineAttrs = (attrs: CustomText[]): CustomText => {
	let final: CustomText = {text: ''};
	for (const a of attrs)
		final = {...final, ...a}
	return final;
}