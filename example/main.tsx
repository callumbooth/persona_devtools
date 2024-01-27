import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./src/App.tsx";

// biome-ignore lint/style/noNonNullAssertion: root will always exist
ReactDOM.createRoot(document.getElementById("root")!).render(
	<React.StrictMode>
		<App />
	</React.StrictMode>,
);
