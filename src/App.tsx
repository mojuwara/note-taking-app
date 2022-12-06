import { useState } from 'react';

import config from './aws-exports';
import { Amplify, Storage } from 'aws-amplify';
import { withAuthenticator,	View } from "@aws-amplify/ui-react";

import AppTheme from './Themes';
import { getFullPath, getStorageItem, getTransitionElemClass } from './Utils';

import MyEditor from './Components/Editor/Editor';
import MyToolbar from './Components/Toolbar/Toolbar';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import { ThemeProvider } from '@mui/material/styles';

import { FileSelection } from './Types';
import { StorageKeys } from './Constants';

import './App.css';
import "@aws-amplify/ui-react/styles.css";

Amplify.configure(config);
Storage.configure({ level: 'private' });

function App({signOut, user}: any) {
	const [drawerOpen, setDrawerOpen] = useState(true);
	const [fileSelection, setFileSelection] = useState<FileSelection>(getStorageItem(StorageKeys.Selection, {file: "", folder: ""}));

	const updateSelection = (sel: FileSelection) => {
		setFileSelection(sel);
		localStorage.setItem(StorageKeys.Selection, JSON.stringify(sel));
	}

	const handleDrawerOpen = () => setDrawerOpen(true);
	const handleDrawerClose = () => setDrawerOpen(false);

	if (!user) {
		return(
			<View>
			</View>
		);
	}

	return (
		// <View className="App">
		<View>
			<ThemeProvider theme={AppTheme}>
			<Box sx={{display: 'flex', flexDirection: 'column', width: '100%', height: '100%'}}>
				<MyToolbar
					user={user}
					signoutBtn={<Button variant="contained" onClick={signOut}>Sign Out</Button>}
					drawerOpen={drawerOpen}
					fileSelection={fileSelection}
					onDrawerOpen={handleDrawerOpen}
					onDrawerClose={handleDrawerClose}
					onSelectionChange={updateSelection} />

					{fileSelection.file && <MyEditor user={user} drawerOpen={drawerOpen} filePath={getFullPath(fileSelection)} />}
					{!fileSelection.file && <h3 className={getTransitionElemClass(drawerOpen)}>Select or create a file</h3>}
			 	</Box>
			</ThemeProvider>
		</View>
  );
}

export default withAuthenticator(App);