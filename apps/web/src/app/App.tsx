import { RouterProvider } from "react-router";
import { Toaster } from "sonner";
import { AuthProvider } from "./lib/auth-context";
import { HighContrastProvider } from "./lib/high-contrast-context";
import { router } from "./routes";

export default function App() {
  return (
    <HighContrastProvider>
      <AuthProvider>
        <RouterProvider router={router} />
        <Toaster richColors position="top-right" />
      </AuthProvider>
    </HighContrastProvider>
  );
}
