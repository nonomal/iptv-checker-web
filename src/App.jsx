import React,{ useState, createContext, useEffect, useRef } from 'react';
import { createTheme, ThemeProvider } from '@mui/material';
import useMediaQuery from '@mui/material/useMediaQuery';
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';
import Menu from './components/layout/menu'

export default function App() {
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');

  const theme = React.useMemo(
    () =>
      createTheme({
        palette: {
          mode: prefersDarkMode ? 'dark' : 'light',
        },
      }),
    [prefersDarkMode],
  );

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ minWidth: 100 }}>
        <Menu></Menu>
      </Box>
    </ThemeProvider>
  );
}