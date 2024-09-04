import React from 'react';
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import Game from './components/Game';

const theme = createTheme();

const App: React.FC = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Game />
    </ThemeProvider>
  );
};

export default App;