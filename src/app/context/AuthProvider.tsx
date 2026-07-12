import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { logGoogleAnalytics } from "../services/analytics-actions";
import { toast } from "sonner";

import {
  getToken,
  getUser,
  getLastActiveTime,
  logoutUser,
} from "../utils/storage";

interface AuthContextType {
  loading: boolean;
  isLoggedIn: boolean;
  user: any;
  setIsLoggedIn: React.Dispatch<React.SetStateAction<boolean>>;
  setUser: React.Dispatch<React.SetStateAction<any>>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

interface AuthProviderProps {
  children: ReactNode;
}
//
const SESSION_DAYS = 30;
// const SESSION_DAYS = 1 / 1440; // 1 minute

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

const convertDaysToDHMS = (diffDays: number) => {
  const totalSeconds = Math.floor(diffDays * 86400);

  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return {
    days,
    hours,
    minutes,
    seconds,
  };
};

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<any>(null);

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

      const now = Date.now();
      const lastActiveMs = new Date(lastActive).getTime();

      const diffMs = now - lastActiveMs;

      const diffDays = diffMs / (1000 * 60 * 60 * 24);

      const elapsed = convertDaysToDHMS(diffDays);

      console.log("Last Login:", formatDateTime(lastActive));

      console.log(
        `Session Age: ${elapsed.days}d ${elapsed.hours}h ${elapsed.minutes}m ${elapsed.seconds}s`,
      );

      const sessionExpired = diffDays >= SESSION_DAYS;

      console.log("Session Expired:", sessionExpired);

      if (sessionExpired) {
        console.log("Session expired. Logging out...");

        await logoutUser();

        setIsLoggedIn(false);
        setUser(null);

        toast.error("Session expired. Please log in again.");

        return;
      }

      setUser(userData);
      setIsLoggedIn(true);
      logGoogleAnalytics.sessionStart();
    } catch (error) {
      console.error("Auth check failed:", error);

      setIsLoggedIn(false);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await logoutUser();
    } catch (error) {
      console.error("Logout failed:", error);
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

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
};
