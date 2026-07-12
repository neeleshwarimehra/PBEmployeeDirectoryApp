import { useEffect, useState } from "react";
import { RouterProvider } from "react-router-dom";
import { Toaster } from "sonner";

import { router } from "./routes";
import { useFavourites } from "./data/favourites";
import { AuthProvider } from "./context/AuthProvider";

import { initializeAnalytics } from "./services/analytics";
import { logGoogleAnalytics } from "./services/analytics-actions";

import { NoInternetScreen } from "./screens/NoInternetScreen";
import { Network } from "@capacitor/network";

import { Component } from "lucide-react";
import Loader from "../app/components/Loader";

export default function App() {
  const [isReady, setIsReady] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [imageLoaded, setImageLoaded] = useState(false);

  // Network Status
  useEffect(() => {
    const initNetwork = async () => {
      const status = await Network.getStatus();
      setIsOnline(status.connected);
      console.log("status.connected");
    };

    initNetwork();

    const listener = Network.addListener("networkStatusChange", (status) => {
      setIsOnline(status.connected);
    });

    return () => {
      listener.then((l) => l.remove());
    };
  }, []);

  // App Initialization
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

  // Show No Internet Screen
  if (!isOnline) {
    return <NoInternetScreen />;
  }

  // Show Loading Screen
  if (!isReady) {
    return (
      <>
        <Loader visible={true} />

        <div className="min-h-screen flex flex-col items-center justify-center bg-white px-6 text-center">
          <img
            src="/assets/pb_logo.png"
            alt="Employee Directory"
            onLoad={() => setImageLoaded(true)}
            className={`w-24 sm:w-32 md:w-40 h-auto ${
              imageLoaded ? "opacity-100" : "opacity-0"
            } transition-opacity duration-300`}
          />

          <h1 className="text-xl sm:text-2xl font-bold text-[#1A3A6B]">
            Employee Directory App
          </h1>

          <p className="mt-4 text-medium text-gray-500">Loading...</p>
        </div>
      </>
    );
  }

  return (
    <AuthProvider>
      <Toaster position="bottom-center" richColors />
      <RouterProvider router={router} />
    </AuthProvider>
  );
}
