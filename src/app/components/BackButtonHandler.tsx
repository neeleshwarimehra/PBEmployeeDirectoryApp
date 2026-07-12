import { useEffect } from "react";
import { App as CapacitorApp } from "@capacitor/app";
import { Network } from "@capacitor/network";
import { useLocation, useNavigate } from "react-router-dom";

export default function BackButtonHandler() {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const setupBackButton = async () => {
      const listener = await CapacitorApp.addListener(
        "backButton",
        async () => {
          try {
            const status = await Network.getStatus();

            // Exit app when No Internet Screen is displayed
            if (!status.connected) {
              CapacitorApp.exitApp();
              return;
            }

            const path = location.pathname;

            // Exit app from Splash, Login and Home
            if (path === "/" || path === "/login" || path === "/app") {
              CapacitorApp.exitApp();
            } else {
              navigate(-1);
            }
          } catch (error) {
            console.error("Back button error:", error);
          }
        },
      );

      return listener;
    };

    let listener: any;

    setupBackButton().then((l) => {
      listener = l;
    });

    return () => {
      listener?.remove();
    };
  }, [location.pathname, navigate]);

  return null;
}
