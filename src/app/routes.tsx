import {
  createBrowserRouter,
  Outlet,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { useEffect } from "react";
import { App as CapacitorApp } from "@capacitor/app";

import ProtectedRoute from "./components/ProtectedRoute";
import { Layout } from "./components/Layout";

import { SplashScreen } from "./screens/SplashScreen";
import { LoginScreen } from "./screens/LoginScreen";
import { HomeScreen } from "./screens/HomeScreen";
import { ContactDetailScreen } from "./screens/ContactDetailScreen";
import { FavouritesScreen } from "./screens/FavouritesScreen";
import { ProfileScreen } from "./screens/ProfileScreen";

function RootLayout() {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const listener = CapacitorApp.addListener("backButton", () => {
      const path = location.pathname;

      // Exit app from Splash, Login and Home
      if (path === "/" || path === "/login" || path === "/app") {
        CapacitorApp.exitApp();
      } else {
        navigate(-1);
      }
    });

    return () => {
      listener.then((l) => l.remove());
    };
  }, [location.pathname, navigate]);

  return <Outlet />;
}

export const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      {
        path: "/",
        element: <SplashScreen />,
      },

      {
        path: "/login",
        element: <LoginScreen />,
      },

      {
        path: "/app",
        element: (
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        ),
        children: [
          {
            index: true,
            element: <HomeScreen />,
          },
          {
            path: "contact/:id",
            element: <ContactDetailScreen />,
          },
          {
            path: "favourites",
            element: <FavouritesScreen />,
          },
          {
            path: "profile",
            element: <ProfileScreen />,
          },
        ],
      },
    ],
  },
]);
