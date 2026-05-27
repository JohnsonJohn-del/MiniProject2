import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./index.css";
import { AuthProvider } from "./context/AuthContext";
import { CurrencyProvider } from "./context/CurrencyContext";
import { AiProvider } from "./context/AiContext";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <CurrencyProvider>
        <AuthProvider>
          <AiProvider>
            <App />
          </AiProvider>
        </AuthProvider>
      </CurrencyProvider>
    </BrowserRouter>
  </React.StrictMode>
);
