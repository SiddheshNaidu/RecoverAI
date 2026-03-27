/**
 * App.jsx — Team UNTITLED | Build-it ON
 * Root: wraps everything in AppProvider. Add routes here if needed.
 */

import { AppProvider } from "./context/AppContext";
import HomePage from "./pages/HomePage";

export default function App() {
  return (
    <AppProvider>
      <HomePage />
    </AppProvider>
  );
}
