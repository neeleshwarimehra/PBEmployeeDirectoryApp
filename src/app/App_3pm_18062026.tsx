import { useEffect, useState } from "react";
import { RouterProvider } from "react-router-dom";
import { Toaster } from "sonner";

import { router } from "./routes";
import { useFavourites } from "./data/favourites";
import { AuthProvider } from "./context/AuthProvider";

import { initializeAnalytics } from "./services/analytics";
import { logGoogleAnalytics } from "./services/analytics-actions";

export default function App() {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    console.log("APP STARTED");
    const initializeApp = async () => {
      try {
        await useFavourites.getState().loadFavourites();

        await initializeAnalytics();

        logGoogleAnalytics.appOpen();
      } catch (error) {
        console.error("App initialization failed:", error);

        logGoogleAnalytics.appError(
          error instanceof Error
            ? error.message
            : "Unknown initialization error",
        );
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
