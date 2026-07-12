import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
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

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    checkLogin();
  }, []);

  function convertDaysToDHMS(diffDays: number) {
    const totalSeconds = Math.floor(diffDays * 24 * 60 * 60);

    const days = Math.floor(totalSeconds / (24 * 60 * 60));
    const hours = Math.floor((totalSeconds % (24 * 60 * 60)) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return {
      days,
      hours,
      minutes,
      seconds,
    };
  }

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

      const diffDays =
        (now.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24);

      const result = convertDaysToDHMS(0.8285957060185185);
      console.log(result);
      console.log("Days since last login diffDays:", diffDays);
      console.log(
        "Days since last login diffDays in days hr min sec=:",
        result,
      );
      console.log("Last LOGIN date and time:", formatDateTime(lastActive));

      if (diffDays > THIRTY_DAYS) {
        await logoutUser();

        setIsLoggedIn(false);
        setUser(null);

        toast.error("Session expired. Please log in again.");
        return;
      }

      setUser(userData);
      setIsLoggedIn(true);
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
