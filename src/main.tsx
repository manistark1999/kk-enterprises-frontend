import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "@/App";
import "@/assets/styles/index.css";

window.onerror = function(message, source, lineno, colno, error) {
  const msg = String(message || '');
  if (msg.includes('pasted-image') || 
      msg.includes('Cannot read') ||
      msg.includes('image input') ||
      msg.includes('model does not support')) {
    return true;
  }
  return false;
};

window.onunhandledrejection = function(event) {
  const msg = String(event.reason?.message || '');
  if (msg.includes('pasted-image') || 
      msg.includes('Cannot read') ||
      msg.includes('model does not support')) {
    event.preventDefault();
  }
};

createRoot(document.getElementById("root")!).render(
  <BrowserRouter>
    <App />
  </BrowserRouter>
);
