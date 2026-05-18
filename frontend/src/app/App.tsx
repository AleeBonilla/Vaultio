import { RouterProvider } from "react-router";
import { Toaster } from "sonner";
import { AuthProvider } from "./lib/auth-context";
import { router } from "./routes";

export default function App() {
  return (
    <AuthProvider>
      <RouterProvider router={router} />
      <Toaster richColors position="top-right" />
    </AuthProvider>
  );
}
