import { useEffect, useState } from "react";
import { RouterProvider } from "react-router-dom";
import { Toaster } from "sonner";

import { router } from "./routes";
import { useFavourites } from "./data/favourites";
import { AuthProvider } from "./context/AuthProvider";

export default function App() {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        await useFavourites.getState().loadFavourites();
      } catch (error) {
        console.error("Failed to load favourites:", error);
      } finally {
        setIsReady(true);
      }
    };

    initializeApp();
  }, []);

  if (!isReady) {
    return (
      <div className="h-screen flex items-center justify-center bg-white">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  return (
    <AuthProvider>
      <Toaster position="bottom-center" richColors />

      <RouterProvider router={router} />
    </AuthProvider>
  );
}
