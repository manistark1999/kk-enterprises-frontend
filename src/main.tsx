import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "@/App";
import "@/assets/styles/index.css";

window.onerror = function(message, source, lineno, colno, error) {
  if (message && (message.toString().includes('pasted-image') || 
      message.toString().includes('Cannot read') ||
      message.toString().includes('image input'))) {
    console.warn('Browser extension error suppressed:', message);
    return true;
  }
  return false;
};

window.onunhandledrejection = function(event) {
  if (event.reason && event.reason.message && 
      (event.reason.message.includes('pasted-image') || 
       event.reason.message.includes('Cannot read'))) {
    console.warn('Browser extension promise error suppressed');
    event.preventDefault();
  }
};

createRoot(document.getElementById("root")!).render(
  <BrowserRouter>
    <App />
  </BrowserRouter>
);
