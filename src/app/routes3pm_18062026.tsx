// import { createBrowserRouter } from "react-router";
import { createBrowserRouter } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import { Layout } from "./components/Layout";

import { SplashScreen } from "./screens/SplashScreen";
import { LoginScreen } from "./screens/LoginScreen";
import { HomeScreen } from "./screens/HomeScreen";
import { ContactDetailScreen } from "./screens/ContactDetailScreen";
import { FavouritesScreen } from "./screens/FavouritesScreen";
import { ProfileScreen } from "./screens/ProfileScreen";

export const router = createBrowserRouter([
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
        path: "/app/contact/:id",
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
]);
