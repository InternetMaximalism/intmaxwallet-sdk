import { lazy } from "react";
import { RouterProvider, createHashRouter } from "react-router-dom";
import GlobalLayout from "./app/layout";

const HomePage = lazy(() => import("./app/home"));
const WalletSettingsPage = lazy(() => import("./app/settings/wallets"));
const NetworksSettingsPage = lazy(() => import("./app/settings/networks"));

const router = createHashRouter([
	{
		path: "/",
		element: <GlobalLayout />,
		children: [
			{ path: "/", element: <HomePage /> },
			{ path: "/settings/wallet", element: <WalletSettingsPage /> },
			{ path: "/settings/networks", element: <NetworksSettingsPage /> },
		],
	},
]);

const root = document.getElementById("root");
if (!root) throw new Error("Root element not found");

export default function App() {
	return <RouterProvider router={router} />;
}
