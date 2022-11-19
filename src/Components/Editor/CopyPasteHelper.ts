import { Node as SlateNode } from "slate";
import { CustomText, ElementTypes, ImageElement, LinkElement, ListItemElement, ListOrderedElement, ListUnorderedElement } from "../../Types";

// Recursively build node tree
// TODO: Many text nodes with newline chars
export const deserialize = (elem: Element): SlateNode[] => {
	console.log("deserializing", elem, elem.nodeName)
	if (elem.nodeType === Node.TEXT_NODE && elem.textContent) {
		return [{text: elem.textContent}];
	} else if (elem.nodeType !== Node.ELEMENT_NODE) {
		return [];
	}

	// Better way of setting type?
	let children: SlateNode[] = Array.from(elem.childNodes as NodeListOf<Element>)
		.map(node => deserialize(node))
		.flat();

	if (children.length === 0)
		children = [{ text: '' }];

	let typedChildren;
	switch (elem.nodeName) {
		case "BODY":
			return children;
		case "P":
			children = filterEmptyTextNodes(children);
			typedChildren = children as (CustomText | LinkElement | ImageElement)[];
			return [{ type: ElementTypes.PARAGRAPH, children: typedChildren }];
		case "A":
			const href = elem.getAttribute('href');
			if (href) {
				children = filterEmptyTextNodes(children);
				typedChildren = children as CustomText[];
				return [{ type: ElementTypes.LINK, href, children: typedChildren}];
			}
			break;
		case "LI":
			typedChildren = children as CustomText[];
			return [{type: ElementTypes.LIST_ITEM, children: typedChildren}];
		case "UL":
			typedChildren = children as (ListOrderedElement | ListUnorderedElement | ListItemElement)[];
			return [{type: ElementTypes.LIST_UNORDERED, children: typedChildren}];
		case "OL":
			typedChildren = children as (ListOrderedElement | ListUnorderedElement | ListItemElement)[];
			return [{ type: ElementTypes.LIST_ORDERED, children: typedChildren }];

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
	return attrs.reduce((prev, curr) => { return {...prev, ...curr} });
}

const filterEmptyTextNodes = (children: SlateNode[]): SlateNode[] => {
	return children.filter(c => !("text" in c && c.text.trim() === ""));
}