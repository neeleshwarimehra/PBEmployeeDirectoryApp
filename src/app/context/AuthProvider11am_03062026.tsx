import { createContext, useContext, useEffect, useState } from "react";
import { toast } from "sonner";
import {
  getToken,
  getUser,
  getLastActiveTime,
  logoutUser,
} from "../utils/storage";

const AuthContext = createContext<any>(null);
const formatDateTime = (dateString: string) => {
  return new Date(dateString).toLocaleString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
};

const THIRTY_DAYS = 30;
// const SESSION_TIMEOUT_MINUTES = 1;

export const AuthProvider = ({ children }: any) => {
  const [loading, setLoading] = useState(true);

  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const [user, setUser] = useState(null);

  useEffect(() => {
    checkLogin();
  }, []);

  const checkLogin = async () => {
    try {
      const token = await getToken();

      const userData = await getUser();

      const lastActive = await getLastActiveTime();

      console.log("Token:", token);

      if (!token || !lastActive) {
        setIsLoggedIn(false);
        setUser(null);
        return;
      }

      const now = new Date();

      const lastDate = new Date(lastActive);

      //const diffMinutes = (now.getTime() - lastDate.getTime()) / (1000 * 60);
      const diffDays =
        (now.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24);

      console.log("Minutes since last active:", diffDays);
      console.log("Last active time:", lastActive);
      console.log("Last active time:", formatDateTime(lastActive));
      // Session expired
      if (diffDays > THIRTY_DAYS) {
        await logoutUser();

        setIsLoggedIn(false);
        setUser(null);

        toast.error("Session expired. Please log in again.");

        return;
      }

      setUser(userData);

      setIsLoggedIn(true);
      //toast.success("User authenticated successfully.");
    } catch (error) {
      console.error("Auth check failed:", error);

      setIsLoggedIn(false);
      setUser(null);
      // toast.error("Session expired. Please log in again.");
      // toast.error(
      //   "An error occurred while checking login status.Please try again.",
      // );
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await logoutUser();
    } finally {
      setIsLoggedIn(false);
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        loading,
        isLoggedIn,
        user,
        setIsLoggedIn,
        setUser,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
