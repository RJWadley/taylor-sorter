import "./index.css";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import SpotifyProvider from "components/SpotifyProvider";
import React from "react";
import { createRoot } from "react-dom/client";

import App from "./App";

const queryClient = new QueryClient();

const rootEl = document.querySelector("#root");
const root = rootEl ? createRoot(rootEl) : undefined;

root?.render(
  <React.StrictMode>
    <SpotifyProvider>
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    </SpotifyProvider>
  </React.StrictMode>
);
