import { useState, useEffect } from "react";
import NavBar from "./Layout/Nav-Bar/NavBar";
import ThemeProvider from "./theme/index";
import { Box, Fade } from "@mui/material";
import Router from "./Routes/Section";
import { BrowserRouter } from "react-router-dom";

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Router />
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
