import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";

import App from "./App.tsx";
import { store } from "./app/store/store.ts";
import { ThemeProvider } from "./app/providers/ThemeProvider";
import AuthInitializer from "./app/providers/AuthInitializer";

import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Provider store={store}>
      <ThemeProvider>
        <AuthInitializer>
          <App />
        </AuthInitializer>
      </ThemeProvider>
    </Provider>
  </StrictMode>,
);