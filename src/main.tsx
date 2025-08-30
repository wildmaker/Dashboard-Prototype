
  import React from "react";
  import { createRoot } from "react-dom/client";
  import App from "./App.tsx";
  import "./index.css";
  import { UncertaintyProvider } from "./components/UncertaintyContext";

  createRoot(document.getElementById("root")!).render(
    <UncertaintyProvider>
      <App />
    </UncertaintyProvider>
  );
  