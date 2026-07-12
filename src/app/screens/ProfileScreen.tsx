import { LogOut, Share2, Mail, Phone, Import } from "lucide-react";
import { useNavigate } from "react-router";
import { useEffect, useState } from "react";
import { useFavourites } from "../data/favourites";
import Footer from "../utils/Footer";
import { Share } from "@capacitor/share";
import { toast } from "sonner";
// import { useAuth } from "../context/AuthProvider";
import { getLoginTime, getUser, logoutUser } from "../utils/storage";
import Loader from "../components/Loader";
import { logGoogleAnalytics } from "../services/analytics-actions";

// const currentUser = {
//   EmployeeId: 1,
//   Name: "Rahul Sharma",
//   Mobile: "1234567890",
//   Email: "rahul.sharma@example.com",
//   DesignationId: 3,
//   DesignationName: "Senior Developer",
//   StationId: 2,
//   StationName: "Mumbai",
// };

export function ProfileScreen() {
  const navigate = useNavigate();
  const { clearFavourites } = useFavourites();
  // const { currentUser, logoutUser } = useAuth();
  const [loginTime, setLoginTime] = useState("");
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLoginTime();
  }, []);

  const loadLoginTime = async () => {
    const value = await getLoginTime();

    if (value) {
      const formatted = new Date(value).toLocaleString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });

      setLoginTime(formatted);
    }
  };

  useEffect(() => {
    const loadUser = async () => {
      const data = await getUser();

      console.log(data);

      setUserData(data);
    };

    loadUser();
  }, []);
  //==========================================
  //==========================================
  useEffect(() => {
    const loadUser = async () => {
      try {
        setLoading(true);

        const [data] = await Promise.all([
          getUser(),
          new Promise((resolve) => setTimeout(resolve, 500)),
        ]);

        console.log(data);

        setUserData(data);
        // toast.success("Profile information retrieved successfully.");
        logGoogleAnalytics.viewProfile();
      } catch (error) {
        console.error("Failed to load user:", error);
        toast.error("Failed to load user:");
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);
  //==========================================
  //==========================================

  const currentUser = userData || {
    EmployeeId: "N/A",
    Name: "N/A",
    Mobile: "N/A",
    Email: "N/A",
    DesignationId: "N/A",
    DesignationName: "N/A",
    StationId: "N/A",
    StationName: "N/A",
  };

  console.log("Authenticated user profile screen:", currentUser);

  //=====
  const handleLogout = async () => {
    const confirmLogout = window.confirm("Are you sure you want to logout?");
    logGoogleAnalytics.logout();
    if (!confirmLogout) return;

    try {
      setLoading(true);
      // Optional delay for smooth logout
      await new Promise((resolve) => setTimeout(resolve, 300));
      //logout success toast
      // CLEAR AUTH STATE + PREFERENCES
      await logoutUser();
      logGoogleAnalytics.sessionClosed();
      logGoogleAnalytics.logoutSuccess();
      toast.success("You have been logged out successfully.");
      // // Navigate to login
      navigate("/login");
      // Run cleanup in background
      setTimeout(() => {
        // // Reset favourites
        clearFavourites();
        // // Clear local storage
        localStorage.clear();
        // // // Clear session storage
        sessionStorage.clear();

        console.log("Storage cleared");
      }, 0);
    } catch (error) {
      console.log("Logout Error:", error);
      logGoogleAnalytics.logoutFail();
      toast.error("Something went wrong. Unable to logout.");
      // Fallback navigation
      //navigate("/login");
    } finally {
      setLoading(false);
    }
  };
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };
  //=====

  const handleShareApp = async () => {
    logGoogleAnalytics.shareAppInfo();
    try {
      await Share.share({
        title: "Prasar Bharati PB Employee Directory App",
        text: `PB Employee Directory App is now available! Access the latest PB Employee Directory, search contacts, and stay connected.\nLink to download the app: ${"https://play.google.com/store/apps/developer?id=Prasar+Bharati+%28All+India+Radio,+Doordarshan%29"}`,
        dialogTitle: "Share App Info:",
      });
    } catch (error) {
      alert("Share feature not supported on this device");
      console.log(error);
    }
    console.log("Share app info,", Share.share.bind(Share));
  };

  return (
    <div className="h-full flex flex-col bg-white overflow-y-auto">
      {/* Header with Avatar */}
      <div className="bg-[#1A3A6B] px-6 pt-6 pb-12">
        <div className="flex flex-col items-center">
          <div className="w-32 h-32 rounded-full bg-[#F4832A] flex items-center justify-center mb-4">
            <span className="text-white text-5xl font-bold">
              {getInitials(currentUser.Name)}
            </span>
          </div>
          <h2 className="text-white text-medium font-bold mb-1">
            {currentUser.Name}
          </h2>
          <p className="text-yellow-300 mb-2 font-bold">
            {currentUser.DesignationName}
          </p>
          <span className="px-3 py-1 rounded-full bg-[#F4832A] text-white text-sm font-medium">
            {currentUser.StationName}
          </span>
        </div>
      </div>

      {/* Contact Information */}
      <div className="px-6 py-6 space-y-6">
        {/* Mobile */}
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
            <Phone className="w-5 h-5 text-gray-600" />
          </div>
          <div className="flex-1">
            <p className="text-xs text-gray-500 mb-1">Mobile Number</p>
            <p className="text-gray-900 font-medium break-all">
              {currentUser.Mobile ?? "Mobile number not available"}
            </p>
            {/* <p className="text-gray-900 font-medium">{currentUser.Mobile}</p> */}
          </div>
        </div>

        {/* Email */}
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
            <Mail className="w-5 h-5 text-gray-600" />
          </div>
          <div className="flex-1">
            <p className="text-xs text-gray-500 mb-1">Email ID</p>
            <p className="text-gray-900 font-medium break-all">
              {currentUser.Email}
            </p>
          </div>
        </div>

        {/* Location */}
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
            <svg
              className="w-5 h-5 text-gray-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
          </div>
          <div className="flex-1">
            <p className="text-xs text-gray-500 mb-1">Location</p>
            <p className="text-gray-900 font-medium">
              {currentUser.StationName}
            </p>
          </div>
        </div>

        {/* Employee ID
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
            <svg
              className="w-5 h-5 text-gray-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M7 7h.01M7 10h.01M7 13h.01M10 7h7M10 10h7M10 13h7M4 4h16a2 2 0 012 2v12a2 2 0 01-2 2H4a2 2 0 01-2-2V6a2 2 0 012-2z"
              />
            </svg>
          </div>
          <div className="flex-1">
            <p className="text-xs text-gray-500 mb-1">Employee ID</p>
            <p className="text-gray-900 font-medium">
              {currentUser.EmployeeId}
            </p>
          </div>
        </div> */}

        {/* Current Login */}
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
            <svg
              className="w-5 h-5 text-gray-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <div className="flex-1">
            <p className="text-xs text-gray-500 mb-1">Last Login Date & Time</p>
            {/* <p className="text-xs text-gray-500 mb-1">
              (login valid for 30 days)
            </p> */}
            <p className="text-gray-900 font-medium">{loginTime}</p>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="px-6 py-6 space-y-3 border-t border-gray-100">
        <button
          onClick={handleShareApp}
          className="w-full flex items-center justify-center gap-3 px-6 py-3 rounded-xl border-2 border-[#1A3A6B] text-[#1A3A6B] font-semibold active:bg-[#1A3A6B] active:text-white transition-all"
        >
          <Share2 className="w-5 h-5" />
          <span>Share App</span>
        </button>

        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-3 px-6 py-3 rounded-xl bg-red-50 text-red-600 font-semibold active:bg-red-100 transition-all"
        >
          <LogOut className="w-5 h-5" />
          <span>Logout</span>
        </button>
      </div>

      {/* App Info */}
      <div className="bg-blue pb-8 text-center space-y-1">
        <Footer />
      </div>
      <Loader visible={loading} />
    </div>
  );
}
