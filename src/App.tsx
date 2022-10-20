import { useState } from 'react'

import AppTheme from './Themes';
import { getTransitionElemClass } from './Utils';

import MyEditor from './Components/Editor/Editor';
import MyToolbar from './Components/Toolbar/Toolbar';

import Box from '@mui/material/Box';
import { ThemeProvider } from '@mui/material/styles';

import './App.css';

function App() {
	const [drawerOpen, setDrawerOpen] = useState(true);
	const [selectedFilePath, setSelectedFilePath] = useState("");	// Will only be file names("", "a/file", "a/b/file" format
	console.log(selectedFilePath)

	const handleDrawerOpen = () => setDrawerOpen(true);
	const handleDrawerClose = () => setDrawerOpen(false);

	return (
		<ThemeProvider theme={AppTheme}>
			<Box sx={{display: 'flex', flexDirection: 'column'}}>
				<MyToolbar
					drawerOpen={drawerOpen}
					selectedFilePath={selectedFilePath}
					onDrawerOpen={handleDrawerOpen}
					onDrawerClose={handleDrawerClose}
					onFileClick={(newPath: string) => setSelectedFilePath(newPath) } />

				{selectedFilePath && <MyEditor drawerOpen={drawerOpen} filePath={selectedFilePath} />}
				{!selectedFilePath && <h3 className={getTransitionElemClass(drawerOpen)}>Select or create a file</h3>}
			</Box>
		</ThemeProvider>
  );
}

export default App;