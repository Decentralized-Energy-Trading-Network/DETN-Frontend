// Layout.jsx
import React from 'react';
import { Box } from '@mui/material';
import NavBar from './NavBar';

const Layout = ({ children }) => {
  return (
    <Box sx={{ display: 'flex' }}>
      <NavBar />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          marginLeft: { xs: '0', sm: '24px' }, // Adjust based on sidebar width when closed
          width: { sm: `calc(100% - 72px)` }, // Match sidebar closed width
          minHeight: '100vh',
          backgroundColor: (theme) => theme.palette.background.default
        }}
      >
        {children}
      </Box>
    </Box>
  );
};

export default Layout;