import { useState } from 'react';

import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';

type CreateItemProps = {
	label: string;	// Displayed when textfield is empty
	title: string;	// Helpful message above textfield
	onClose: () => void;
	onCreate: (s: string) => void;
}

const CreateItemDialog = (props: CreateItemProps) => {
	const [value, setValue] = useState("");

	return (
		<div>
			<Dialog open={true} onClose={props.onClose}>
				<DialogTitle>{props.title}</DialogTitle>
				<DialogContent>
					<TextField
						id="name"
						autoFocus
						fullWidth
						value={value}
						margin="dense"
						variant="standard"
						label={props.label}
						onChange={(event) => setValue(event.target.value)}
					/>
				</DialogContent>
				<DialogActions>
					<Button onClick={props.onClose}>Cancel</Button>
					<Button onClick={() => props.onCreate(value)}>Create</Button>
				</DialogActions>
			</Dialog>
		</div>
	)
}

export default CreateItemDialog;