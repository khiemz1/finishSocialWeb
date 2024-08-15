import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import RegistrationForm from "./App.jsx";
import "./index.css";
import { ChakraProvider, ColorModeScript, extendTheme } from "@chakra-ui/react";
import { RecoilRoot } from "recoil";
import { SocketContextProvider } from "./context/SocketContext.jsx";
import App from "./App.jsx";

const styles = {
  global: {
    body: {
      color: { light: "gray.800", dark: "whiteAlpha.900" },
      bg: { light: "gray.100", dark: "#101010" },
    },
  },
};

const config = {
  initialColorMode: "dark",
  useSystemColorMode: true,
};

const colors = {
  gray: {
    light: "#616161",
    dark: "#1e1e1e",
  },
};

const theme = extendTheme({
  config,
  styles: {
    global: (props) => ({
      body: {
        color:
          props.colorMode === "dark"
            ? styles.global.body.color.dark
            : styles.global.body.color.light,
        bg:
          props.colorMode === "dark"
            ? styles.global.body.bg.dark
            : styles.global.body.bg.light,
      },
    }),
  },
  colors,
});

ReactDOM.createRoot(document.getElementById("root")).render(
  
  <React.StrictMode>
    <RecoilRoot>
      <BrowserRouter>
        <ChakraProvider theme={theme}>
          <ColorModeScript initialColorMode={theme.config.initialColorMode} />
          <SocketContextProvider>
          <App />
          </SocketContextProvider>
        </ChakraProvider>
      </BrowserRouter>
    </RecoilRoot>
  </React.StrictMode>
);
