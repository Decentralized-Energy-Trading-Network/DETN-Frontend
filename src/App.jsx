import { useState, useEffect } from "react";
import NavBar from "./Layout/Nav-Bar/NavBar";
import ThemeProvider from "./theme/index";
import { Box, Fade } from "@mui/material";
import Router from "./Routes/Section";
import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";
import  store  from "./api/index";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function App() {
  return (
    <>
      <Provider store={store}>
        <ThemeProvider>
          <BrowserRouter>
            <Router />
          </BrowserRouter>
        </ThemeProvider>
        <ToastContainer
          position="bottom-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="colored"
          style={{ fontSize: '14px' }}
          toastStyle={{
            borderRadius: '8px',
            marginBottom: '1rem',
          }}
          progressStyle={{
            background: 'rgba(255, 255, 255, 0.7)',
          }}
        />
      </Provider>
    </>
  );
}

export default App;
