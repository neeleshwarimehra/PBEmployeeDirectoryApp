import { createBrowserRouter } from "react-router";
import ProtectedRoute from "./components/ProtectedRoute";
import { Layout } from "./components/Layout";
import { SplashScreen } from "./screens/SplashScreen";
import { LoginScreen } from "./screens/LoginScreen";
import { HomeScreen } from "./screens/HomeScreen";
import { ContactDetailScreen } from "./screens/ContactDetailScreen";
import { FavouritesScreen } from "./screens/FavouritesScreen";
import { ProfileScreen } from "./screens/ProfileScreen";
import { AuthProvider } from "./context/AuthProvider";

export const router = createBrowserRouter([
  // SPLASH
  {
    path: "/",
    element: <SplashScreen />,
  },

  // LOGIN
  {
    path: "/login",
    element: (
      <AuthProvider>
        <LoginScreen />
      </AuthProvider>
    ),
  },

  // PROTECTED APP ROUTES
  {
    path: "/app",
    element: (
      <AuthProvider>
        <ProtectedRoute>
          <Layout />
        </ProtectedRoute>
      </AuthProvider>
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
