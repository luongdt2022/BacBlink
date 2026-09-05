import { RouterProvider } from "react-router";
import { router } from "./router-config";
import { AuthProvider } from "@/features/auth";
import { Toaster } from "@/shared/ui";

export default function App() {
  return (
    <AuthProvider>
      <RouterProvider router={router} />
      <Toaster />
    </AuthProvider>
  );
}