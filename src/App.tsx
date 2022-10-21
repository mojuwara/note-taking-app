import { useState } from 'react'

import AppTheme from './Themes';
import { getFullPath, getTransitionElemClass } from './Utils';

import MyEditor from './Components/Editor/Editor';
import MyToolbar from './Components/Toolbar/Toolbar';

import Box from '@mui/material/Box';
import { ThemeProvider } from '@mui/material/styles';

import './App.css';
import { FileSelection } from './Types';

function App() {
	const [drawerOpen, setDrawerOpen] = useState(true);
	const [fileSelection, setFileSelection] = useState<FileSelection>({file: "", folder: ""});
	console.log(fileSelection)

	const handleDrawerOpen = () => setDrawerOpen(true);
	const handleDrawerClose = () => setDrawerOpen(false);

	return (
		<ThemeProvider theme={AppTheme}>
			<Box sx={{display: 'flex', flexDirection: 'column'}}>
				<MyToolbar
					drawerOpen={drawerOpen}
					fileSelection={fileSelection}
					onDrawerOpen={handleDrawerOpen}
					onDrawerClose={handleDrawerClose}
					onSelectionChange={(selection: FileSelection) => setFileSelection(selection) } />

				{fileSelection.file && <MyEditor drawerOpen={drawerOpen} filePath={getFullPath(fileSelection)} />}
				{!fileSelection.file && <h3 className={getTransitionElemClass(drawerOpen)}>Select or create a file</h3>}
			</Box>
		</ThemeProvider>
  );
}

export default App;