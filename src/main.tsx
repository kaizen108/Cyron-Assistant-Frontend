import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
// @ts-expect-error react-alert ships without TS types in this repo
import { positions, Provider as AlertProvider } from "react-alert";
import App from "./App";
import "./styles/index.css";
import { AuthProvider } from "./hooks/useAuth";
import { AppProvider } from "./context/AppContext";
import { AlertTemplate } from "./components/alerts/AlertTemplate";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000, // data stays fresh for 30s — no refetch on every nav
      gcTime: 5 * 60_000, // keep cache for 5 min
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AlertProvider
          template={AlertTemplate}
          position={positions.TOP_RIGHT}
          timeout={6000}
          offset="16px"
        >
          <AppProvider>
            <AuthProvider>
              <App />
            </AuthProvider>
          </AppProvider>
        </AlertProvider>
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>,
);
