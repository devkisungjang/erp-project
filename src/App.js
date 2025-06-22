import React from "react";
import "./App.css";
import { Reset } from "styled-reset";
import Layout from "./components/Layout/Layout.jsx";
import Main from "./pages/Main";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient({
  /* options */
});

function App() {
  return (
    <>
      <QueryClientProvider client={queryClient}>
        <Reset />
        <Layout>
          <Main />
        </Layout>
      </QueryClientProvider>
    </>
  );
}

export default App;
