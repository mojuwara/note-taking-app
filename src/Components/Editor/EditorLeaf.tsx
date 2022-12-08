import { useState } from 'react';

import Box from '@mui/material/Box';
import Popper from '@mui/material/Popper';
import TextField from '@mui/material/TextField';

import { RenderLeafProps } from 'slate-react';

import { DICTIONARY, getUndefinedWords, isProperlyDefined, updateWordDefinition } from '../../Utils';

// TODO: Unit tests
export const Leaf = (props: RenderLeafProps) => {
	const word = props.leaf.text;
	const [persistPopper, setPersistPopper] = useState(false);
	const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
	const [definition, setDefinition] = useState(DICTIONARY[word] || '');

	// TODO: Render the entire component after updating definition
	const handleDefinitionChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
		setDefinition(event.target.value);
		updateWordDefinition(word, event.target.value);
	};

	const handleClick = (event: React.MouseEvent<HTMLElement>) => {
		if (!props.leaf.isUncommonWord)
			return;

		if (persistPopper) {
			setAnchorEl(null);
			setPersistPopper(false);
		} else {
			setPersistPopper(true);
			setAnchorEl(event.currentTarget);
		}
	};

	const handleMouseEnter = (e: React.MouseEvent<HTMLSpanElement, MouseEvent>) => {
		if (persistPopper || !props.leaf.isUncommonWord)
			return;
		setAnchorEl(e.currentTarget);
	}

	const handleMouseLeave = (e: React.MouseEvent<HTMLSpanElement, MouseEvent>) => {
		if (persistPopper || !props.leaf.isUncommonWord)
			return;
		setAnchorEl(null);
	}

	const getBackgroundColor = () => {
		return (props.leaf.isUncommonWord && !isProperlyDefined(word)) ? 'sandybrown' : undefined;
	}

	// Undeline if user-styled with underline or if it's an uncommon
	const getTextDecorationLine = () => {
		return (props.leaf.underline || props.leaf.isUncommonWord) ? 'underline' : 'none';
	}

	// Dashed underline for uncommon words
	const getTextDecorationStyle = () => {
		return (props.leaf.isUncommonWord) ? 'dashed' : undefined;
	}

	// Pointer for uncommon word
	const getCursorStyle = () => {
		return (props.leaf.isUncommonWord) ? 'pointer' : undefined;
	}

	const style: React.CSSProperties = {
		cursor							: getCursorStyle(),
		backgroundColor			: getBackgroundColor(),
		textDecorationLine	: getTextDecorationLine(),
		textDecorationStyle	: getTextDecorationStyle(),
		fontWeight					: (props.leaf.bold) ? 'bold' : 'normal',
		fontStyle						: (props.leaf.italic) ? 'italic' : 'normal',
	}

	return (
		<>
			<span
				style={style}
				{...props.attributes}
				onClick={handleClick}
				onMouseEnter={handleMouseEnter}
				onMouseLeave={handleMouseLeave}>
				{props.children}
			</span>
			<Popper open={anchorEl !== null} anchorEl={anchorEl} placement='bottom-start'>
				<Box sx={{ border: 1, bgcolor: 'background.paper' }}>
					{<DictionaryPopup
						word={word}
						definition={definition}
						handleChange={handleDefinitionChange}
						needToDefine={getUndefinedWords(definition)} />}
				</Box>
			</Popper>
		</>
	);
}

// TODO: Latex support, show common formulas/conversions
// TODO: "Save" button so we update the dictionary less frequently?
// TODO: When typing something like formulas/units/acronyms, display popup/sidebar with useful info
type DictionaryPopupProps = {
	word: string;
	definition: string;
	needToDefine: string[];
	handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
};

export const DictionaryPopup = (props: DictionaryPopupProps) => {
	// TODO: MUI: Too many re-renders. The layout is unstable.
	const helperText = (props.needToDefine.length) ? `Also define: ${props.needToDefine.join(', ')}` : undefined;
	return (
		<TextField
			rows={2}
			multiline
			variant="filled"
			helperText={helperText}
			value={props.definition}
			onChange={props.handleChange}
			label={`Define '${props.word}'`}
		/>
	);
}
