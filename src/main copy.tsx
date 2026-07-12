import { createRoot } from "react-dom/client";
import App from "./app/App.tsx";
import "./styles/index.css";

import { initCrashlytics } from "./app/services/crashlytics.ts";

createRoot(document.getElementById("root")!).render(<App />);
initCrashlytics();
