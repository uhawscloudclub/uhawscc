import { createRoot } from "react-dom/client";
import App from "./App.tsx";
// Static import so sonner's styles ship as a normal same-origin stylesheet
// (covered by CSP's style-src 'self'). sonner still also injects its CSS via
// a runtime <style> tag unconditionally — that's handled separately via a
// CSP hash in server.js. Must load before index.css so Tailwind's utility
// classes in ui/sonner.tsx keep winning any specificity ties, matching the
// cascade order sonner's own runtime injection already produced.
import "sonner/dist/styles.css";
import "./index.css";

createRoot(document.getElementById("root")!).render(<App />);
