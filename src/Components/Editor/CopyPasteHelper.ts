import { Node as SlateNode, Element as SlateElement } from "slate";
import { TableHelper } from "./TableHelper";
import {
	CustomText,
	ElementTypes,
	ImageElement,
	LinkElement,
	ListItemElement,
	ListOrderedElement,
	ListUnorderedElement,
	TableBodyElement,
	TableDataElement,
	TableElement,
	TableHeadElement,
	TableHeaderElement,
	TableRowElement
} from "../../Types";

// Recursively build node tree
// TODO: Many text nodes with newline chars
export const deserialize = (elem: Element): SlateNode[] => {
	// console.log("deserializing", elem, elem.nodeName)
	if (elem.nodeType === Node.TEXT_NODE && elem.textContent) {
		return [{text: elem.textContent}];
	} else if (elem.nodeType !== Node.ELEMENT_NODE) {
		return [];
	}

	// Better way of setting type?
	let children: SlateNode[] = Array.from(elem.childNodes as NodeListOf<Element>)
		.map(node => deserialize(node))
		.flat();
	children = filterEmptyTextNodes(children);

	if (children.length === 0)
		children = [{ text: '' }];

	let typedChildren;
	switch (elem.nodeName) {
		case "BODY":
			return children;
		case "P":
			typedChildren = children as (CustomText | LinkElement | ImageElement)[];
			return [{ type: ElementTypes.PARAGRAPH, children: typedChildren }];
		case "A":
			const href = elem.getAttribute('href');
			if (!href)
				break;
			typedChildren = children as CustomText[];
			return [{ type: ElementTypes.LINK, href, children: typedChildren}];
		case "LI":
			typedChildren = children as CustomText[];
			return [{type: ElementTypes.LIST_ITEM, children: typedChildren}];
		case "UL":
			typedChildren = children as (ListOrderedElement | ListUnorderedElement | ListItemElement)[];
			return [{type: ElementTypes.LIST_UNORDERED, children: typedChildren}];
		case "OL":
			typedChildren = children as (ListOrderedElement | ListUnorderedElement | ListItemElement)[];
			return [{ type: ElementTypes.LIST_ORDERED, children: typedChildren }];
		case "H1":
			typedChildren = children as CustomText[];
			return [{ type: ElementTypes.H1, children: typedChildren }];
		case "H2":
			typedChildren = children as CustomText[];
			return [{ type: ElementTypes.H2, children: typedChildren }];
		case "H3":
			typedChildren = children as CustomText[];
			return [{ type: ElementTypes.H3, children: typedChildren }];
		case "TABLE":
			typedChildren = children as (TableHeadElement | TableBodyElement)[];
			const table: TableElement = { type: ElementTypes.TABLE, children: typedChildren }
			console.log(table)
			TableHelper.updateTableCellPos2(table);
			return [table];
		case "THEAD":
			typedChildren = children as TableRowElement[];
			return [{ type: ElementTypes.TABLE_HEAD, children: typedChildren }];
		case "TR":
			typedChildren = children as (TableHeaderElement[] | TableDataElement[]);
			return [{ type: ElementTypes.TABLE_ROW, children: typedChildren }];
		case "TH":
			typedChildren = children as CustomText[];
			return [{ type: ElementTypes.TABLE_HEADER, children: typedChildren }];
		case "TBODY":
			typedChildren = children as TableRowElement[];
			return [{ type: ElementTypes.TABLE_BODY, children: typedChildren }];
		case "TD":
			typedChildren = children as CustomText[];
			return [{type: ElementTypes.TABLE_DATA, children: typedChildren}];
		case "IMG":
			const url = elem.getAttribute('src');
			if (!url)
				break;

			typedChildren = children as CustomText[];
			return [{ type: ElementTypes.IMAGE, url, children: typedChildren }];

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