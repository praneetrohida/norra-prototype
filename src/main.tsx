import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Toast } from "@heroui/react";
import "./index.css";
import App from "./App";
import { StoreProvider } from "./store";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <StoreProvider>
        <App />
        <Toast.Provider placement="top" />
      </StoreProvider>
    </BrowserRouter>
  </StrictMode>,
);
