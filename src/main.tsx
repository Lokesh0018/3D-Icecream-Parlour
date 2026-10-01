import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import App from "./App";
import Patterns from "./pages/Patterns";
import Layout from "./Layout";
import { meta } from "@/site/site";

document.title = meta.title ?? "Website";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<App />} />
          <Route path="/patterns" element={<Patterns />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  </React.StrictMode>
);
