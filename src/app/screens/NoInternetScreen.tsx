import { useEffect, useState } from "react";
import Loader from "../components/Loader";

import { App as CapacitorApp } from "@capacitor/app";
import { Capacitor } from "@capacitor/core";
import { Settings } from "lucide-react";
import {
  NativeSettings,
  AndroidSettings,
  IOSSettings,
} from "capacitor-native-settings";

export function NoInternetScreen() {
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const listener = CapacitorApp.addListener("backButton", () => {
      CapacitorApp.exitApp();
    });

    return () => {
      listener.then((l) => l.remove());
    };
  }, []);

  const handleReload = () => {
    setLoading(true);

    setTimeout(() => {
      window.location.reload();
    }, 1000);
  };

  const openNetworkSettings = async () => {
    try {
      const platform = Capacitor.getPlatform();

      if (platform === "android") {
        await NativeSettings.openAndroid({
          option: AndroidSettings.Wireless,
        });
        return;
      }

      if (platform === "ios") {
        await NativeSettings.openIOS({
          option: IOSSettings.App,
        });
        return;
      }

      // Web
      alert(
        "Please enable Wi-Fi or Mobile Data from your device settings and click Reload.",
      );
    } catch (error) {
      console.error("Failed to open settings:", error);
    }
  };

  return (
    <>
      <Loader visible={loading} />

      <div className="min-h-screen flex flex-col items-center justify-center bg-white px-6">
        <div className="max-w-sm text-center">
          <div className="text-6xl mb-4">📶</div>

          <h1 className="text-2xl font-bold text-gray-800">
            No Internet Connection
          </h1>

          <p className="mt-3 text-gray-500">
            Please check your internet connection and try again.
          </p>

          <div className="flex items-center justify-center gap-3 mt-4">
            {Capacitor.getPlatform() !== "web" && (
              <button
                onClick={openNetworkSettings}
                className="px-3 py-1 text-sm bg-gray-200 text-gray-700 rounded-full hover:bg-blue-300"
              >
                ⚙️ Settings
              </button>
            )}

            {/* <button
              onClick={handleReload}
              disabled={loading}
              className="w-full px-6 py-3 rounded-lg bg-blue-600 text-white font-medium disabled:opacity-50"
            >
              {loading ? "Checking..." : "↻ Reload"}
            </button> */}
          </div>

          <div className="flex flex-col gap-3 mt-6">
            {/* <button
              onClick={openNetworkSettings}
              className="w-full px-6 py-3 rounded-lg bg-[#1A3A6B] text-white font-medium"
            >
              Open Settings
            </button> */}

            <button
              onClick={handleReload}
              disabled={loading}
              className="w-full px-6 py-3 rounded-lg bg-blue-600 text-white font-bold disabled:opacity-50"
            >
              {loading ? "Checking..." : "Reload"}
            </button>
          </div>

          <p className="mt-4 text-xs text-gray-400">
            Press the Back button to exit the app.
          </p>
        </div>
      </div>
    </>
  );
}
