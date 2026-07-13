import { createRoot } from "react-dom/client";
import App from "./app/App.tsx";
import MarketingLanding from "./app/screens/MarketingLanding.tsx";
import "./styles/index.css";

const Root = window.location.pathname.replace(/\/$/, "").endsWith("/landing") ? MarketingLanding : App;
createRoot(document.getElementById("root")!).render(<Root />);
