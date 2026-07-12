import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router";
import { ArrowLeft, CheckCircle } from "lucide-react";
import { motion } from "framer-motion"; // Changed to 'framer-motion' for standard compatibility
import Footer from "../utils/Footer";
import Loader from "../components/Loader";
import { isGovEmail, validateEmail } from "../utils/emailUtils";
import { logGoogleAnalytics } from "../services/analytics-actions";

import {
  saveToken,
  saveUser,
  saveLoginTime,
  saveUserData,
  updateLastActiveTime,
  saveDirectoryData,
} from "../utils/storage";
import { useAuth } from "../context/AuthProvider";
import { toast } from "sonner";
import { sendOtpApi, verifyOtpApi } from "../api/authApi";

type Step = "email" | "otp" | "success";

export function LoginScreen() {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState("");
  const [attemptsLeft, setAttemptsLeft] = useState(3);
  const [timer, setTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);
  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [loading, setLoading] = useState(false);
  // const isLive = true;
  const isLive = false;

  useEffect(() => {
    if (step === "otp" && timer > 0) {
      const interval = setInterval(() => {
        setTimer((prev) => {
          if (prev <= 1) {
            setCanResend(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [step, timer]);

  //handle send otp
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    logGoogleAnalytics.sendOtp();
    const trimmedEmail = email.trim().toLowerCase();

    if (!validateEmail(trimmedEmail)) {
      setError("Please enter a valid email address.");
      return;
    }

    if (!isGovEmail(trimmedEmail)) {
      setError("Please enter a valid official email id");
      return;
    }

    try {
      setError("");

      setStep("otp");
      setTimer(59);
      setCanResend(false);

      if (isLive) {
        await handleSendOtpAPI();
      } else {
        toast.success("OTP sent successfully.");
      }
    } catch (error) {
      console.error(error);

      toast.error("Failed to send OTP.");
      setError("Failed to send OTP.");
    }
  };
  ///=====================================
  ///=====================================
  // =========================
  // SEND OTP API
  // =========================
  // const handleSendOtpAPI = async () => {
  //   setLoading(true);

  //   try {
  //     const response = await sendOtpApi(email);

  //     const data = response?.data;

  //     if (!data) {
  //       throw new Error("Invalid server response");
  //     }

  //     console.log("OTP API response:", data);

  //     toast.success("OTP sent to your email address.");

  //     // OPTIONAL: if backend returns any info (like expiry, message, etc.)
  //     // you can store it here if needed
  //     // setOtpMeta(data);

  //     // show OTP input (uncomment if needed)
  //     // setShowOtpBox(true);
  //   } catch (error: any) {
  //     console.error("Send OTP failed:", error);

  //     const message = error?.response?.data?.message || "Failed to send OTP";

  //     toast.error(message);
  //   } finally {
  //     setLoading(false);
  //   }
  // };
  const handleSendOtpAPI = async () => {
    try {
      setLoading(true);
      logGoogleAnalytics.sendOtpAPI();
      const data = await sendOtpApi(email);
      console.log("handleSendOtpAPI called");
      console.log("OTP API response:", data);

      toast.success(data?.message || "OTP sent to your email address.");

      // Show OTP input box if needed
      // setShowOtpBox(true);

      // Store response if needed
      // setOtpMeta(data);
    } catch (error: any) {
      console.error("Send OTP failed:", error);

      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to send OTP";

      toast.error(message);
      toast.error("Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };
  ///=====================================
  ///=====================================

  ///=====================================
  ///=====================================
  // =========================
  // VERIFY OTP OLD
  // =========================
  // const handleVerifyOtpAPI = async () => {
  //   const otpValue = otp.join("");
  //   setLoading(true);

  //   try {
  //     const response = await verifyOtpApi(email, otpValue);

  //     const data = response?.data;

  //     if (!data) {
  //       throw new Error("Invalid server response");
  //     }

  //     console.log("OTP verified successfully:", data);

  //     // ================= SUCCESS TOAST =================
  //     toast.success("Login successful. Welcome to Employee Directory.");

  //     // ================= SAVE DATA =================
  //     await saveDirectoryData(data.employees, data.designations, data.stations);

  //     await saveToken(data.JWTtoken);
  //     await saveUserData(data);
  //     await saveUser(data.empprofile);

  //     await saveLoginTime();
  //     await updateLastActiveTime();

  //     // ================= AUTH STATE =================
  //     setUser(data.empprofile);
  //     setIsLoggedIn(true);
  //     setStep("success");
  //     // ================= NAVIGATION =================
  //     setTimeout(() => {
  //       navigate("/app");
  //     }, 1500);
  //   } catch (error: any) {
  //     console.error("OTP verification failed:", error);
  //     toast.error(error?.response?.data?.message || "Invalid OTP");
  //     const newAttempts = attemptsLeft - 1;
  //     setAttemptsLeft(newAttempts);

  //     const message =
  //       newAttempts > 0
  //         ? `Incorrect OTP. ${newAttempts} attempt${
  //             newAttempts > 1 ? "s" : ""
  //           } remaining`
  //         : "Too many failed attempts. Please try again later.";

  //     setError(message);
  //     toast.error(error?.response?.data?.message || message);

  //     setOtp(["", "", "", "", "", ""]);
  //     otpInputRefs.current[0]?.focus();
  //   } finally {
  //     setLoading(false);
  //   }
  // };
  // =========================
  // VERIFY OTP NEW
  // =========================
  const handleVerifyOtpAPI = async () => {
    const otpValue = otp.join("");

    logGoogleAnalytics.verifyOtp();
    if (otpValue.length !== 6) {
      toast.error("Please enter a valid 6-digit OTP");
      return;
    }

    try {
      setLoading(true);
      // verifyOtpApi already returns response.data
      const data = await verifyOtpApi(email, otpValue);

      console.log("OTP verification response:", data);

      // Check API success flag
      if (!data?.success) {
        throw new Error(data?.message || "OTP verification failed");
      }

      // Success message
      toast.success("Login successful. Welcome to Employee Directory.");
      logGoogleAnalytics.loginSuccess();
      // Save master directory data
      await saveDirectoryData(
        data?.employees || [],
        data?.designations || [],
        data?.stations || [],
      );

      // Save JWT token
      await saveToken(data?.token);

      // Save complete response if required
      await saveUserData(data);

      // Save logged-in user profile
      await saveUser(data?.empprofile);

      // Save login metadata
      await saveLoginTime();
      await updateLastActiveTime();

      // Update auth state
      setUser(data?.empprofile);
      setIsLoggedIn(true);
      setStep("success");

      console.log("User Profile:", data?.empprofile);
      console.log("Token:", data?.token);

      // Navigate to app
      setTimeout(() => {
        navigate("/app");
      }, 1500);
    } catch (error: any) {
      console.error("OTP verification failed:", error);

      const newAttempts = attemptsLeft - 1;
      setAttemptsLeft(newAttempts);

      const apiMessage = error?.response?.data?.message || error?.message;

      const fallbackMessage =
        newAttempts > 0
          ? `Incorrect OTP. ${newAttempts} attempt${
              newAttempts > 1 ? "s" : ""
            } remaining`
          : "Too many failed attempts. Please try again later.";

      const finalMessage = apiMessage || fallbackMessage;

      setError(finalMessage);
      toast.error(finalMessage);

      // Clear OTP boxes
      setOtp(["", "", "", "", "", ""]);

      // Focus first OTP box
      otpInputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };
  ///=====================================
  ///=====================================

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    setError("");

    if (value && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyOtp = async () => {
    const otpValue = otp.join("");
    if (otpValue.length !== 6) return;
    console.log("Verifying OTP= otpValue:", otpValue);
    if (isLive) {
      await handleVerifyOtpAPI();
    } else {
      await verifyOTPStatic();
    }
  };

  const handleResendOtp = () => {
    console.log("Resending OTP to:", email);
    setTimer(30);
    setCanResend(true); // Set to false once API call starts
    setOtp(["", "", "", "", "", ""]);
    setError("");
    setAttemptsLeft(3);
    // Trigger your Send OTP API here
    if (isLive) {
      handleSendOtpAPI();
    }
  };

  const { setIsLoggedIn, setUser } = useAuth();

  const verifyOTPStatic = async () => {
    // Simulation of OTP check
    const otpValue = otp.join("");
    setLoading(true);
    if (otpValue === "123456") {
      setStep("success");
      await handleStaticLogin();
      setTimeout(async () => {}, 0);
      setLoading(false);
      setTimeout(() => {
        navigate("/app");
      }, 2000);
    } else {
      const newAttempts = attemptsLeft - 1;
      setAttemptsLeft(newAttempts);
      setError(
        newAttempts > 0
          ? `Incorrect OTP. ${newAttempts} attempt${
              newAttempts > 1 ? "s" : ""
            } remaining`
          : "Too many failed attempts. Please try again later.",
      );
      setOtp(["", "", "", "", "", ""]);
      otpInputRefs.current[0]?.focus();
      setLoading(false);
    }
  };

  //static login
  const handleStaticLogin = async () => {
    try {
      // STATIC API RESPONSE
      setLoading(true);
      const response = {
        success: true,
        token:
          "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbXBDb2RlIjoxMjcwMzgwLCJpYXQiOjE3ODA0OTA1OTQsImV4cCI6MTc4MzA4MjU5NH0.B3WRFtTJ5N72Sp34oCC5vTHpVmbKQp3f-yJQ3hC2I88",
        empprofile: {
          EmployeeId: 1270380,
          Name: "NEELESHWARI MEHRA",
          Mobile: "1234567890",
          Email: "neelshwarimehra.dev@gmail.com",
          DesignationId: 193,
          DesignationName: "Senior Engineering Assistant",
          StationId: 2412,
          StationName: "PB-DELHI P & D UNIT - AIR",
        },
        employees: [
          {
            EmpCode: 1,
            Name: "SANJEEV KUMAR SAXENA",
            Mobile: "1234567890",
            Email: "sksaxena@prasarbharati.gov.in",
            DesignationId: 5,
            DesignationName: "Additional Director General (Engineering)",
            StationId: 2412,
            StationName: "PB-DELHI P & D UNIT - AIR",
          },
          {
            EmpCode: 2,
            Name: "ANIL KUMAR PATHAK",
            Mobile: "1234567890",
            Email: "anilkumarpathak@prasarbharati.gov.in",
            DesignationId: 19,
            DesignationName: "Assistant Director (Programme)",
            StationId: 2412,
            StationName: "PB-DELHI P & D UNIT - AIR",
          },
          {
            EmpCode: 3,
            Name: "GAJENDRA SHARMA",
            Mobile: null,
            Email: "gajendrasharma@prasarbharati.gov.in",
            DesignationId: 21,
            DesignationName: "Assistant Director( Engineering)",
            StationId: 2412,
            StationName: "PB-DELHI P & D UNIT - AIR",
          },
          {
            EmpCode: 4,
            Name: "ANIL KUMAR SINGH",
            Mobile: "1234567890",
            Email: "anilkumarsingh1@prasarbharati.gov.in",
            DesignationId: 21,
            DesignationName: "Assistant Director( Engineering)",
            StationId: 2412,
            StationName: "PB-DELHI P & D UNIT - AIR",
          },
          {
            EmpCode: 5,
            Name: "RAVI KANT SINGH",
            Mobile: "1234567890",
            Email: "ravikantsingh@prasarbharati.gov.in",
            DesignationId: 21,
            DesignationName: "Assistant Director( Engineering)",
            StationId: 2412,
            StationName: "PB-DELHI P & D UNIT - AIR",
          },
          {
            EmpCode: 6,
            Name: "SANDEEP SRIVASTAVA",
            Mobile: "1234567890",
            Email: "sandeepsri@prasarbharati.gov.in",
            DesignationId: 21,
            DesignationName: "Assistant Director( Engineering)",
            StationId: 2412,
            StationName: "PB-DELHI P & D UNIT - AIR",
          },
          {
            EmpCode: 7,
            Name: "Kamakhya Narayan Pandey",
            Mobile: "1234567890",
            Email: "knpandey@prasarbharati.gov.in",
            DesignationId: 21,
            DesignationName: "Assistant Director( Engineering)",
            StationId: 2412,
            StationName: "PB-DELHI P & D UNIT - AIR",
          },
        ],
        designations: [
          {
            Id: 1,
            Name: "Accounts Officer  ",
          },
          {
            Id: 3,
            Name: "Additional Director General (News)  ",
          },
          {
            Id: 4,
            Name: "Additional Director General (Programme)",
          },
          {
            Id: 5,
            Name: "Additional Director General (Engineering)",
          },
          {
            Id: 6,
            Name: "Administrative Officer  ",
          },
          {
            Id: 8,
            Name: "Announcer Grade-II   ",
          },
          {
            Id: 9,
            Name: "Announcer Grade-III  ",
          },
          {
            Id: 10,
            Name: "Announcer Grade-IV",
          },
          {
            Id: 13,
            Name: "Architectural Assistant",
          },
          {
            Id: 14,
            Name: "Head Clerk/Assistant  ",
          },
          {
            Id: 16,
            Name: "Technical Officer  ",
          },
          {
            Id: 17,
            Name: "Assistant Director (News)",
          },
          {
            Id: 18,
            Name: "Assistant Director (Official Language)",
          },
          {
            Id: 19,
            Name: "Assistant Director (Programme)",
          },
          {
            Id: 21,
            Name: "Assistant Director( Engineering)",
          },
          {
            Id: 22,
            Name: "Assistant Engineer",
          },
          {
            Id: 23,
            Name: "Assistant Engineer (CIVIL)",
          },
          {
            Id: 24,
            Name: "Assistant Engineer (CIVIL)",
          },
          {
            Id: 27,
            Name: "Assistant Engineer (Electrical)",
          },
          {
            Id: 28,
            Name: "Assistant Engineer (Electrical)",
          },
          {
            Id: 29,
            Name: "Engineering Assistant to Superintending Engineer (Electrical)",
          },
          {
            Id: 33,
            Name: "Assistant Resarch Officer Grade-I  ",
          },
          {
            Id: 34,
            Name: "Assistant Resarch Officer Grade-II   ",
          },
          {
            Id: 37,
            Name: "Cameraman Grade-I",
          },
          {
            Id: 38,
            Name: "Cameraman Grade-II",
          },
          {
            Id: 39,
            Name: "Cameraman Grade-III",
          },
          {
            Id: 42,
            Name: "Chief Engineer (Level I)   ",
          },
          {
            Id: 44,
            Name: "Chief Estimator  ",
          },
          {
            Id: 47,
            Name: "MTS",
          },
          {
            Id: 55,
            Name: "Helper",
          },
          {
            Id: 57,
            Name: "Ferro Khalasi",
          },
          {
            Id: 60,
            Name: "MTS",
          },
          {
            Id: 65,
            Name: "Lower Division Clerk",
          },
          {
            Id: 66,
            Name: "Lower Division Clerk",
          },
          {
            Id: 68,
            Name: "Lower Division Clerk",
          },
          {
            Id: 69,
            Name: "Lower Division Clerk",
          },
          {
            Id: 72,
            Name: "General Assistant Jr",
          },
          {
            Id: 82,
            Name: "Data Entry Operator",
          },
          {
            Id: 85,
            Name: "Deputy Director Administration(FO)",
          },
          {
            Id: 88,
            Name: "Deputy Director (Audience Research) ",
          },
          {
            Id: 89,
            Name: "Deputy Director (News)  ",
          },
          {
            Id: 90,
            Name: "Deputy Director General (Engineering)",
          },
          {
            Id: 95,
            Name: "Deputy Director(Engineering)",
          },
          {
            Id: 96,
            Name: "Diesel Engine Driver",
          },
          {
            Id: 97,
            Name: "Diesel Technician",
          },
          {
            Id: 99,
            Name: "Director (News)  ",
          },
          {
            Id: 101,
            Name: "Director General (News)",
          },
          {
            Id: 102,
            Name: "Director (Programme)",
          },
          {
            Id: 103,
            Name: "Director(Engineering)",
          },
          {
            Id: 104,
            Name: "Draftsman Grade- I/ Head Draftsman",
          },
          {
            Id: 105,
            Name: "Draftsman Grade- I/ Head Draftsman",
          },
          {
            Id: 106,
            Name: "Draftsman Grade-II",
          },
          {
            Id: 107,
            Name: "Draftsman Grade-II",
          },
          {
            Id: 108,
            Name: "Draftsman Grade-III / Tracer (CCW)  ",
          },
          {
            Id: 109,
            Name: "Draftsman Grade-III / Tracer   ",
          },
          {
            Id: 110,
            Name: "Edit Supervisor ",
          },
          {
            Id: 112,
            Name: "Engineering Assistant",
          },
          {
            Id: 113,
            Name: "Executive Engineer(Electr.)",
          },
          {
            Id: 115,
            Name: "Executive Engineer(Civil)",
          },
          {
            Id: 119,
            Name: "Video Editor",
          },
          {
            Id: 121,
            Name: "Floor Assistant",
          },
          {
            Id: 122,
            Name: "Floor Manager",
          },
          {
            Id: 123,
            Name: "Graphic Artist",
          },
          {
            Id: 124,
            Name: "Graphic Supervisor",
          },
          {
            Id: 126,
            Name: "Head Clerk/Assistant",
          },
          {
            Id: 127,
            Name: "Accountant",
          },
          {
            Id: 128,
            Name: "Head Clerk/Assistant",
          },
          {
            Id: 131,
            Name: "Hindi Translator   ",
          },
          {
            Id: 132,
            Name: "Hindi translator Senior (HQ)",
          },
          {
            Id: 133,
            Name: "Hindi translator Junior (HQ)",
          },
          {
            Id: 135,
            Name: "Instrumentalist Grade-I  ",
          },
          {
            Id: 136,
            Name: "Instrumentalist Grade-II  ",
          },
          {
            Id: 137,
            Name: "Instrumentalist Grade-III",
          },
          {
            Id: 138,
            Name: "Instrumentalist Grade-IV ",
          },
          {
            Id: 139,
            Name: "Investigator",
          },
          {
            Id: 142,
            Name: "Joint Director (News)  ",
          },
          {
            Id: 144,
            Name: "Junior Account Officer/SAS",
          },
          {
            Id: 145,
            Name: "Junior Engineer (Civil)",
          },
          {
            Id: 146,
            Name: "Junior Engineer (Elect.)",
          },
          {
            Id: 148,
            Name: "Library and Information Assistant",
          },
          {
            Id: 149,
            Name: "Lighting Assistant",
          },
          {
            Id: 150,
            Name: "Makeup Artist",
          },
          {
            Id: 151,
            Name: "Makeup Assistant",
          },
          {
            Id: 152,
            Name: "Mast Technician",
          },
          {
            Id: 156,
            Name: "Music Composer Group-I",
          },
          {
            Id: 157,
            Name: "Music Composer Group-II  ",
          },
          {
            Id: 158,
            Name: "Music Composer Group-III  ",
          },
          {
            Id: 159,
            Name: "Music Composer Group-IV  ",
          },
          {
            Id: 160,
            Name: "News Editor",
          },
          {
            Id: 161,
            Name: "News Reporter",
          },
          {
            Id: 163,
            Name: "Newsreader-cum-Translator Grade-I",
          },
          {
            Id: 165,
            Name: "Newsreader-cum-Translator Grade-II",
          },
          {
            Id: 167,
            Name: "Newsreader-cum-Translator Grade-III",
          },
          {
            Id: 168,
            Name: "News Reader Grade-III  ",
          },
          {
            Id: 169,
            Name: "Painter",
          },
          {
            Id: 173,
            Name: "Private Secretary  ",
          },
          {
            Id: 174,
            Name: "Production Assistant",
          },
          {
            Id: 175,
            Name: "Programme Executive ",
          },
          {
            Id: 179,
            Name: "Reception Officer Jr",
          },
          {
            Id: 181,
            Name: "Reporter ",
          },
          {
            Id: 183,
            Name: "Senior Accountant",
          },
          {
            Id: 186,
            Name: "Section Officer",
          },
          {
            Id: 187,
            Name: "Security Guard  ",
          },
          {
            Id: 188,
            Name: "Security Officer Grade-I  ",
          },
          {
            Id: 189,
            Name: "Security Officer Grade-II  ",
          },
          {
            Id: 191,
            Name: "Senior Administrative Officer/Inspector of Accounts",
          },
          {
            Id: 193,
            Name: "Senior Engineering Assistant",
          },
          {
            Id: 199,
            Name: "Senior Technician",
          },
          {
            Id: 203,
            Name: "Special Correspondent/ Special Correspondent  Abroad - AIR",
          },
          {
            Id: 204,
            Name: "News Editor",
          },
          {
            Id: 205,
            Name: "Driver(CCW)",
          },
          {
            Id: 206,
            Name: "Driver (Ordinary Grade)",
          },
          {
            Id: 208,
            Name: "Stenographer Grade I/Personal Assistant  ",
          },
          {
            Id: 209,
            Name: "Stenographer Grade I/Personal Assistant",
          },
          {
            Id: 210,
            Name: "Stenographer Grade II",
          },
          {
            Id: 212,
            Name: "Stenographer Grade-III",
          },
          {
            Id: 214,
            Name: "Upper Division Clerk",
          },
          {
            Id: 216,
            Name: "Upper Division Clerk",
          },
          {
            Id: 217,
            Name: "Superintending Engineer(Civil)   ",
          },
          {
            Id: 218,
            Name: "Superintending Engineer(Electrical)   ",
          },
          {
            Id: 220,
            Name: "Tailor",
          },
          {
            Id: 222,
            Name: "Technician  ",
          },
          {
            Id: 223,
            Name: "Translator cum Announcer (Foreign Language- Indian Nationals)",
          },
          {
            Id: 226,
            Name: "Translator cum Announcer (Indian Language )",
          },
          {
            Id: 228,
            Name: "Transmission Executive ",
          },
          {
            Id: 230,
            Name: "Lower Division Clerk",
          },
          {
            Id: 232,
            Name: "Upper Division Clerk  ",
          },
          {
            Id: 237,
            Name: "Additional Director General (Admin)  ",
          },
          {
            Id: 239,
            Name: "Deputy Director (Programme) ",
          },
          {
            Id: 240,
            Name: "Deputy Director Administration(FO)",
          },
          {
            Id: 241,
            Name: "Program Executive ( In - Situ)",
          },
          {
            Id: 242,
            Name: "Carpenter",
          },
          {
            Id: 246,
            Name: "MTS",
          },
          {
            Id: 247,
            Name: "Driver Gr.I",
          },
          {
            Id: 248,
            Name: "Driver - Special Grade",
          },
          {
            Id: 249,
            Name: "Lift Man/Lift Operator",
          },
          {
            Id: 250,
            Name: "Principal Private Secretary",
          },
          {
            Id: 251,
            Name: "Bearer",
          },
          {
            Id: 252,
            Name: "Counter Clerk",
          },
          {
            Id: 253,
            Name: "Halwai",
          },
          {
            Id: 258,
            Name: "Driver (Ordinary Grade)",
          },
          {
            Id: 261,
            Name: "Assitant Accounts Officer",
          },
          {
            Id: 262,
            Name: "Tea/ Coffee Maker",
          },
          {
            Id: 263,
            Name: "Temporary Status Worker ",
          },
          {
            Id: 264,
            Name: "Assistant Director (News)",
          },
          {
            Id: 266,
            Name: "Assistant Engineer (Electrical) (P)",
          },
          {
            Id: 270,
            Name: "Director General",
          },
          {
            Id: 271,
            Name: "Personal Assistant",
          },
          {
            Id: 273,
            Name: "Ferro Printer",
          },
          {
            Id: 274,
            Name: "Assistant Engineer (C) (P)",
          },
          {
            Id: 275,
            Name: "Senior Accounts Officer",
          },
          {
            Id: 277,
            Name: "Wiremen(CCW)",
          },
          {
            Id: 278,
            Name: "Pump Operator(CCW)",
          },
          {
            Id: 279,
            Name: "Khallasi(CCW)",
          },
          {
            Id: 281,
            Name: "Mason",
          },
          {
            Id: 282,
            Name: "Plumber",
          },
          {
            Id: 283,
            Name: "Fitter",
          },
          {
            Id: 284,
            Name: "Beldar",
          },
          {
            Id: 285,
            Name: "Sewerman",
          },
          {
            Id: 287,
            Name: "Enquiry Clerk",
          },
          {
            Id: 288,
            Name: "AC Mechanic",
          },
          {
            Id: 289,
            Name: "Trainee",
          },
          {
            Id: 293,
            Name: "Senior Principal Private Secretary",
          },
          {
            Id: 294,
            Name: "Assistant Section Officer",
          },
          {
            Id: 296,
            Name: "CHIEF EXECUTIVE OFFICER",
          },
          {
            Id: 309,
            Name: "News Editor",
          },
          {
            Id: 311,
            Name: "Operator (E & M)",
          },
          {
            Id: 312,
            Name: "Electrician",
          },
          {
            Id: 314,
            Name: "Assistant Library and Information Officer",
          },
        ],
        stations: [
          {
            StationId: 293,
            StationName: "PB-NONGSTOIN CRS - AIR",
          },
          {
            StationId: 294,
            StationName: "PB-WILLIAMNAGAR CRS - AIR",
          },
          {
            StationId: 295,
            StationName: "PB-SAIHA CRS - AIR",
          },
          {
            StationId: 296,
            StationName: "PB-MON CRS - AIR",
          },
          {
            StationId: 297,
            StationName: "PB-TUENSANG CRS - AIR",
          },
          {
            StationId: 307,
            StationName: null,
          },
          {
            StationId: 337,
            StationName: "PB-DAVANGERE RELAY - AIR",
          },
          {
            StationId: 342,
            StationName: "PB-KASARAGOD RELAY - AIR",
          },
          {
            StationId: 344,
            StationName: "PB-MANDSAUR RELAY - AIR",
          },
          {
            StationId: 349,
            StationName: "PB-WARDHA RELAY - AIR",
          },
          {
            StationId: 352,
            StationName: "PB-MALEGAON RELAY - AIR",
          },
          {
            StationId: 377,
            StationName: "PB-THANJAVUR RELAY - AIR",
          },
          {
            StationId: 379,
            StationName: "PB-VELLORE RELAY - AIR",
          },
          {
            StationId: 380,
            StationName: "PB-THIRUPATTUR RELAY - AIR",
          },
          {
            StationId: 402,
            StationName: "PB-ADILABAD LRS - AIR",
          },
          {
            StationId: 403,
            StationName: "PB-ANANTAPUR LRS - AIR",
          },
          {
            StationId: 404,
            StationName: "PB-KURNOOL LRS - AIR",
          },
          {
            StationId: 405,
            StationName: "PB-MERKAPURAM LRS - AIR",
          },
          {
            StationId: 406,
            StationName: "PB-NIZAMABAD LRS - AIR",
          },
          {
            StationId: 407,
            StationName: "PB-TIRUPATHI LRS - AIR",
          },
          {
            StationId: 408,
            StationName: "PB-WARANGAL LRS - AIR",
          },
          {
            StationId: 409,
            StationName: "PB-ZIRO LRS - AIR",
          },
          {
            StationId: 410,
            StationName: "PB-DIPHU LRS - AIR",
          },
          {
            StationId: 411,
            StationName: "PB-HAFLONG LRS - AIR",
          },
          {
            StationId: 412,
            StationName: "PB-JORHAT LRS - AIR",
          },
          {
            StationId: 413,
            StationName: "PB-NAGAON LRS - AIR",
          },
          {
            StationId: 414,
            StationName: "PB-PURNEA LRS - AIR",
          },
          {
            StationId: 415,
            StationName: "PB-SASARAM LRS - AIR",
          },
          {
            StationId: 416,
            StationName: "PB-BILASPUR LRS - AIR",
          },
          {
            StationId: 417,
            StationName: "PB-RAIGARH LRS - AIR",
          },
          {
            StationId: 418,
            StationName: "PB-SARAIPALLI LRS - AIR",
          },
          {
            StationId: 419,
            StationName: "PB-GODHRA LRS - AIR",
          },
          {
            StationId: 420,
            StationName: "PB-SURAT LRS - AIR",
          },
          {
            StationId: 421,
            StationName: "PB-HIMMATNAGAR LRS - AIR",
          },
          {
            StationId: 422,
            StationName: "PB-HISAR LRS - AIR",
          },
          {
            StationId: 423,
            StationName: "PB-KURUKSHETRA LRS - AIR",
          },
          {
            StationId: 424,
            StationName: "PB-HAMIRPUR LRS - AIR",
          },
          {
            StationId: 425,
            StationName: "PB-KATHUA LRS - AIR",
          },
          {
            StationId: 426,
            StationName: "PB-POONCH LRS - AIR",
          },
          {
            StationId: 427,
            StationName: "PB-CHAIBASA LRS - AIR",
          },
          {
            StationId: 428,
            StationName: "PB-DALTONGANJ LRS - AIR",
          },
          {
            StationId: 429,
            StationName: "PB-HAJARIBAGH LRS - AIR",
          },
          {
            StationId: 430,
            StationName: "PB-BIJAPUR (VIJAYPURAM) LRS - AIR",
          },
          {
            StationId: 431,
            StationName: "PB-CHITRADURG LRS - AIR",
          },
          {
            StationId: 432,
            StationName: "PB-HOSPET LRS - AIR",
          },
          {
            StationId: 433,
            StationName: "PB-KARWAR LRS - AIR",
          },
          {
            StationId: 434,
            StationName: "PB-RAICHUR LRS - AIR",
          },
          {
            StationId: 435,
            StationName: "PB-KOCHI(COCHIN) LRS - AIR",
          },
          {
            StationId: 436,
            StationName: "PB-MANJERI LRS - AIR",
          },
          {
            StationId: 437,
            StationName: "PB-BALAGHAT LRS - AIR",
          },
          {
            StationId: 438,
            StationName: "PB-BETUL LRS - AIR",
          },
          {
            StationId: 439,
            StationName: "PB-CHHINDWARA LRS - AIR",
          },
          {
            StationId: 440,
            StationName: "PB-GUNA LRS - AIR",
          },
          {
            StationId: 441,
            StationName: "PB-KHANDWA LRS - AIR",
          },
          {
            StationId: 442,
            StationName: "PB-SAGAR LRS - AIR",
          },
          {
            StationId: 443,
            StationName: "PB-MANDLA LRS - AIR",
          },
          {
            StationId: 444,
            StationName: "PB-RAJGARH LRS - AIR",
          },
          {
            StationId: 445,
            StationName: "PB-AHMEDNAGAR LRS - AIR",
          },
          {
            StationId: 446,
            StationName: "PB-AKOLA LRS - AIR",
          },
          {
            StationId: 447,
            StationName: "PB-BEED LRS - AIR",
          },
          {
            StationId: 448,
            StationName: "PB-CHANDRAPUR LRS - AIR",
          },
          {
            StationId: 449,
            StationName: "PB-DHULE LRS - AIR",
          },
          {
            StationId: 450,
            StationName: "PB-NANDED LRS - AIR",
          },
          {
            StationId: 451,
            StationName: "PB-NASIK LRS - AIR",
          },
          {
            StationId: 452,
            StationName: "PB-OSMANABAD LRS - AIR",
          },
          {
            StationId: 453,
            StationName: "PB-SATARA LRS - AIR",
          },
          {
            StationId: 454,
            StationName: "PB-SOLAPUR LRS - AIR",
          },
          {
            StationId: 455,
            StationName: "PB-YAVATMAL LRS - AIR",
          },
          {
            StationId: 456,
            StationName: "PB-CHURACHANDPUR LRS - AIR",
          },
          {
            StationId: 457,
            StationName: "PB-JOWAI LRS - AIR",
          },
          {
            StationId: 458,
            StationName: "PB-MOKOKCHUNG LRS - AIR",
          },
          {
            StationId: 459,
            StationName: "PB-BARIPADA LRS - AIR",
          },
          {
            StationId: 460,
            StationName: "PB-BERHAMPUR LRS - AIR",
          },
          {
            StationId: 461,
            StationName: "PB-BOLANGIR LRS - AIR",
          },
          {
            StationId: 462,
            StationName: "PB-JORANDA LRS - AIR",
          },
          {
            StationId: 463,
            StationName: "PB-KEONJHAR LRS - AIR",
          },
          {
            StationId: 464,
            StationName: "PB-PURI LRS - AIR",
          },
          {
            StationId: 465,
            StationName: "PB-ROURKELA LRS - AIR",
          },
          {
            StationId: 466,
            StationName: "PB-SORO LRS - AIR",
          },
          {
            StationId: 467,
            StationName: "PB-BATINDA LRS - AIR",
          },
          {
            StationId: 468,
            StationName: "PB-PATIALA LRS - AIR",
          },
          {
            StationId: 469,
            StationName: "PB-ALWAR LRS - AIR",
          },
          {
            StationId: 470,
            StationName: "PB-BANSWARA LRS - AIR",
          },
          {
            StationId: 471,
            StationName: "PB-CHITTORGARH LRS - AIR",
          },
          {
            StationId: 472,
            StationName: "PB-JHALAWAR LRS - AIR",
          },
          {
            StationId: 473,
            StationName: "PB-KOTA LRS - AIR",
          },
          {
            StationId: 474,
            StationName: "PB-NAGAUR LRS - AIR",
          },
          {
            StationId: 475,
            StationName: "PB-SAWAI MADHOPUR LRS - AIR",
          },
          {
            StationId: 476,
            StationName: "PB-NAGARCOIL LRS - AIR",
          },
          {
            StationId: 477,
            StationName: "PB-DHARMAPURI LRS - AIR",
          },
          {
            StationId: 478,
            StationName: "PB-BELONIA LRS - AIR",
          },
          {
            StationId: 479,
            StationName: "PB-KAILASHAHAR LRS - AIR",
          },
          {
            StationId: 480,
            StationName: "PB-DAMAN LRS - AIR",
          },
          {
            StationId: 481,
            StationName: "PB-KARAIKAL LRS - AIR",
          },
          {
            StationId: 482,
            StationName: "PB-BAREILLY LRS - AIR",
          },
          {
            StationId: 483,
            StationName: "PB-FAIZABAD LRS - AIR",
          },
          {
            StationId: 484,
            StationName: "PB-JHANSI LRS - AIR",
          },
          {
            StationId: 485,
            StationName: "PB-MURSHIDABAD LRS - AIR",
          },
          {
            StationId: 486,
            StationName: "PB-SHANTINIKETAN LRS - AIR",
          },
          {
            StationId: 487,
            StationName: "PB-KADAPA (CUDDAPAH) REGIONAL - AIR",
          },
          {
            StationId: 488,
            StationName: "PB-HYDERABAD CAPITAL ST - AIR",
          },
          {
            StationId: 489,
            StationName: "PB-KOTHAGUDAM LRS - AIR",
          },
          {
            StationId: 490,
            StationName: "PB-VIJAYWADA CAPITAL ST - AIR",
          },
          {
            StationId: 491,
            StationName: "PB-VISHAKHAPATNAM REGIONAL - AIR",
          },
          {
            StationId: 492,
            StationName: "PB-ITANAGAR CAPITAL ST - AIR",
          },
          {
            StationId: 493,
            StationName: "PB-PASSIGHAT REGIONAL - AIR",
          },
          {
            StationId: 494,
            StationName: "PB-TAWANG REGIONAL - AIR",
          },
          {
            StationId: 495,
            StationName: "PB-TEZU REGIONAL - AIR",
          },
          {
            StationId: 496,
            StationName: "PB-DIBRUGARH REGIONAL - AIR",
          },
          {
            StationId: 497,
            StationName: "PB-GUWAHATI CAPITAL ST - AIR",
          },
          {
            StationId: 498,
            StationName: "PB-KOKRAJHAR REGIONAL - AIR",
          },
          {
            StationId: 499,
            StationName: "PB-SILCHAR REGIONAL - AIR",
          },
          {
            StationId: 500,
            StationName: "PB-TEZPUR REGIONAL - AIR",
          },
          {
            StationId: 501,
            StationName: "PB-BHAGALPUR REGIONAL - AIR",
          },
          {
            StationId: 502,
            StationName: "PB-DARBHANGA REGIONAL - AIR",
          },
          {
            StationId: 503,
            StationName: "PB-PATNA CAPITAL ST - AIR",
          },
          {
            StationId: 504,
            StationName: "PB-AMBIKAPUR REGIONAL - AIR",
          },
          {
            StationId: 505,
            StationName: "PB-JAGDALPUR REGIONAL - AIR",
          },
          {
            StationId: 506,
            StationName: "PB-RAIPUR CAPITAL ST - AIR",
          },
          {
            StationId: 507,
            StationName: "PB-DELHI BH METRO - AIR",
          },
          {
            StationId: 508,
            StationName: "PB-DELHI ADG(R&D)",
          },
          {
            StationId: 509,
            StationName: "PB-DELHI DG:AIR",
          },
          {
            StationId: 510,
            StationName: "PB-DELHI KHAMPUR HPT - AIR",
          },
          {
            StationId: 511,
            StationName: "PB-DELHI KINGSWAY HPT - AIR",
          },
          {
            StationId: 512,
            StationName: "PB-DELHI NATIONAL CHANNEL - AIR",
          },
          {
            StationId: 513,
            StationName: "PB-DELHI NEWS SERVICES DIVISION - AIR",
          },
          {
            StationId: 514,
            StationName: "PB-DELHI NABM",
          },
          {
            StationId: 515,
            StationName: "PB-PANAJI CAPITAL ST - AIR",
          },
          {
            StationId: 516,
            StationName: "PB-AHMEDABAD CAPITAL ST - AIR",
          },
          {
            StationId: 517,
            StationName: "PB-AHWA LRS - AIR",
          },
          {
            StationId: 518,
            StationName: "PB-BHUJ REGIONAL - AIR",
          },
          {
            StationId: 519,
            StationName: "PB-RAJKOT REGIONAL - AIR",
          },
          {
            StationId: 520,
            StationName: "PB-ROHTAK CAPITAL ST - AIR",
          },
          {
            StationId: 521,
            StationName: "PB-DHARMSHALA LRS - AIR",
          },
          {
            StationId: 522,
            StationName: "PB-SHIMLA CAPITAL ST - AIR",
          },
          {
            StationId: 523,
            StationName: "PB-JAMMU CAPITAL ST - AIR",
          },
          {
            StationId: 524,
            StationName: "PB-KARGIL REGIONAL - AIR",
          },
          {
            StationId: 525,
            StationName: "PB-LEH REGIONAL - AIR",
          },
          {
            StationId: 526,
            StationName: "PB-SRINAGAR CAPITAL ST - AIR",
          },
          {
            StationId: 527,
            StationName: "PB-BHADARWAH LRS - AIR",
          },
          {
            StationId: 528,
            StationName: "PB-JAMSHEDPUR REGIONAL - AIR",
          },
          {
            StationId: 529,
            StationName: "PB-RANCHI CAPITAL ST - AIR",
          },
          {
            StationId: 530,
            StationName: "PB-BANGALORE CAPITAL ST - AIR",
          },
          {
            StationId: 531,
            StationName: "PB-BHADRAWATI REGIONAL - AIR",
          },
          {
            StationId: 532,
            StationName: "PB-BELLARY LRS - AIR",
          },
          {
            StationId: 533,
            StationName: "PB-DHARWAD REGIONAL - AIR",
          },
          {
            StationId: 534,
            StationName: "PB-GULBARGA REGIONAL - AIR",
          },
          {
            StationId: 535,
            StationName: "PB-HASSAN LRS - AIR",
          },
          {
            StationId: 536,
            StationName: "PB-MANGALORE/UDIPI REGIONAL - AIR",
          },
          {
            StationId: 537,
            StationName: "PB-MERCARA (MADIKERI) LRS - AIR",
          },
          {
            StationId: 538,
            StationName: "PB-MYSURU REGIONAL - AIR",
          },
          {
            StationId: 539,
            StationName: "PB-KOZHIKODE/CALICUT REGIONAL - AIR",
          },
          {
            StationId: 540,
            StationName: "PB-CANNANOR (KANNUR) LRS",
          },
          {
            StationId: 541,
            StationName: "PB-DEVIKULAM (IDUKKI) LRS - AIR",
          },
          {
            StationId: 542,
            StationName: "PB-THRISSUR REGIONAL - AIR",
          },
          {
            StationId: 543,
            StationName: "PB-THIRUVANANTHAPURAM CAPITAL ST - AIR",
          },
          {
            StationId: 544,
            StationName: "PB-BHOPAL CAPITAL ST - AIR",
          },
          {
            StationId: 545,
            StationName: "PB-CHHATARPUR REGIONAL - AIR",
          },
          {
            StationId: 547,
            StationName: "PB-INDORE REGIONAL - AIR",
          },
          {
            StationId: 548,
            StationName: "PB-JABALPUR REGIONAL - AIR",
          },
          {
            StationId: 549,
            StationName: "PB-REWA REGIONAL - AIR",
          },
          {
            StationId: 550,
            StationName: "PB-SHAHDOL LRS - AIR",
          },
          {
            StationId: 551,
            StationName: "PB-SHIVPURI LRS - AIR",
          },
          {
            StationId: 552,
            StationName: "PB-AURANGABAD REGIONAL - AIR",
          },
          {
            StationId: 553,
            StationName: "PB-JALGAON REGIONAL - AIR",
          },
          {
            StationId: 554,
            StationName: "PB-KOLHAPUR REGIONAL - AIR",
          },
          {
            StationId: 555,
            StationName: "PB-MUMBAI BH METRO - AIR",
          },
          {
            StationId: 556,
            StationName: "PB-NAGPUR REGIONAL - AIR",
          },
          {
            StationId: 557,
            StationName: "PB-PARBHANI REGIONAL - AIR",
          },
          {
            StationId: 558,
            StationName: "PB-PUNE REGIONAL - AIR",
          },
          {
            StationId: 559,
            StationName: "PB-RATNAGIRI REGIONAL - AIR",
          },
          {
            StationId: 560,
            StationName: "PB-SANGLI LRS - AIR",
          },
          {
            StationId: 561,
            StationName: "PB-ORAS (SINDHDURGANAGARI) SLRS - AIR",
          },
          {
            StationId: 562,
            StationName: "PB-IMPHAL CAPITAL ST - AIR",
          },
          {
            StationId: 563,
            StationName: "PB-SHILLONG CAPITAL ST - AIR",
          },
          {
            StationId: 564,
            StationName: "PB-TURA REGIONAL - AIR",
          },
          {
            StationId: 565,
            StationName: "PB-AIZAWL CAPITAL ST - AIR",
          },
          {
            StationId: 566,
            StationName: "PB-LUNGLEI LRS - AIR",
          },
          {
            StationId: 567,
            StationName: "PB-KOHIMA CAPITAL ST - AIR",
          },
          {
            StationId: 568,
            StationName: "PB-BHAWANIPATNA REGIONAL - AIR",
          },
          {
            StationId: 569,
            StationName: "PB-CUTTACK CAPITAL ST - AIR",
          },
          {
            StationId: 570,
            StationName: "PB-JEYPORE REGIONAL - AIR",
          },
          {
            StationId: 571,
            StationName: "PB-SAMBALPUR REGIONAL - AIR",
          },
          {
            StationId: 572,
            StationName: "PB-JALANDHAR CAPITAL ST - AIR",
          },
          {
            StationId: 573,
            StationName: "PB-BARMER REGIONAL - AIR",
          },
          {
            StationId: 574,
            StationName: "PB-BIKANER REGIONAL - AIR",
          },
          {
            StationId: 575,
            StationName: "PB-CHURU REGIONAL - AIR",
          },
          {
            StationId: 576,
            StationName: "PB-JAIPUR CAPITAL ST - AIR",
          },
          {
            StationId: 577,
            StationName: "PB-JAISALMER REGIONAL - AIR",
          },
          {
            StationId: 579,
            StationName: "PB-MOUNT ABU LRS - AIR",
          },
          {
            StationId: 580,
            StationName: "PB-SURATGARH REGIONAL - AIR",
          },
          {
            StationId: 581,
            StationName: "PB-UDAIPUR REGIONAL - AIR",
          },
          {
            StationId: 582,
            StationName: "PB-GANGTOK CAPITAL ST - AIR",
          },
          {
            StationId: 583,
            StationName: "PB-CHENNAI METRO - AIR",
          },
          {
            StationId: 584,
            StationName: "PB-COIMBATORE REGIONAL - AIR",
          },
          {
            StationId: 585,
            StationName: "PB-KODAIKANAL LRS - AIR",
          },
          {
            StationId: 586,
            StationName: "PB-MADURAI REGIONAL - AIR",
          },
          {
            StationId: 588,
            StationName: "PB-TIRUCHIRAPALLI REGIONAL - AIR",
          },
          {
            StationId: 589,
            StationName: "PB-TIRUNELVELI REGIONAL - AIR",
          },
          {
            StationId: 590,
            StationName: "PB-TUTICORIN REGIONAL - AIR",
          },
          {
            StationId: 591,
            StationName: "PB-AGARTALA CAPITAL ST - AIR",
          },
          {
            StationId: 592,
            StationName: "PB-PUDDUCHERRY CAPITAL ST - AIR",
          },
          {
            StationId: 593,
            StationName: "PB-KAVARATTI LRS - AIR",
          },
          {
            StationId: 594,
            StationName: "PB-PORT BLAIR CAPITAL ST - AIR",
          },
          {
            StationId: 595,
            StationName: "PB-AGRA REGIONAL - AIR",
          },
          {
            StationId: 596,
            StationName: "PB-ALLAHABAD REGIONAL - AIR",
          },
          {
            StationId: 597,
            StationName: "PB-GORAKHPUR REGIONAL - AIR",
          },
          {
            StationId: 598,
            StationName: "PB-LUCKNOW CAPITAL ST - AIR",
          },
          {
            StationId: 599,
            StationName: "PB-MATHURA REGIONAL - AIR",
          },
          {
            StationId: 600,
            StationName: "PB-NAJIBABAD REGIONAL - AIR",
          },
          {
            StationId: 602,
            StationName: "PB-RAMPUR (UP) REGIONAL - AIR",
          },
          {
            StationId: 603,
            StationName: "PB-VARANASI REGIONAL - AIR",
          },
          {
            StationId: 604,
            StationName: "PB-ALMORA REGIONAL - AIR",
          },
          {
            StationId: 605,
            StationName: "PB-GOPESHWAR(CHAMOLI) SLRS - AIR",
          },
          {
            StationId: 606,
            StationName: "PB-PAURI GARHWAL LRS - AIR",
          },
          {
            StationId: 607,
            StationName: "PB-KOLKATA METRO - AIR",
          },
          {
            StationId: 608,
            StationName: "PB-KURSEONG REGIONAL - AIR",
          },
          {
            StationId: 609,
            StationName: "PB-SILIGURI REGIONAL - AIR",
          },
          {
            StationId: 610,
            StationName: "PB-KARIMNAGAR RELAY - AIR",
          },
          {
            StationId: 613,
            StationName: "PB-SURYAPET RELAY - AIR",
          },
          {
            StationId: 614,
            StationName: "PB-MEHBOOBNAGAR RELAY - AIR",
          },
          {
            StationId: 615,
            StationName: "PB-SRIKAKULAM RELAY - AIR",
          },
          {
            StationId: 616,
            StationName: "PB-DHUBRI RELAY - AIR",
          },
          {
            StationId: 620,
            StationName: "PB-KASAULI RELAY - AIR",
          },
          {
            StationId: 621,
            StationName: "PB-KINNAUR(KALPA) RELAY - AIR",
          },
          {
            StationId: 622,
            StationName: "PB-KULLU RELAY - AIR",
          },
          {
            StationId: 630,
            StationName: "PB-KUPWARA RELAY - AIR",
          },
          {
            StationId: 631,
            StationName: "PB-KHALTSI RELAY - AIR",
          },
          {
            StationId: 632,
            StationName: "PB-NAUSHERA RELAY - AIR",
          },
          {
            StationId: 633,
            StationName: "PB-RAJOURI RELAY - AIR",
          },
          {
            StationId: 634,
            StationName: "PB-DRASS RELAY - AIR",
          },
          {
            StationId: 635,
            StationName: "PB-TIESURU RELAY - AIR",
          },
          {
            StationId: 636,
            StationName: "PB-NYOMA RELAY - AIR",
          },
          {
            StationId: 637,
            StationName: "PB-DISKIT RELAY - AIR",
          },
          {
            StationId: 638,
            StationName: "PB-PADUM RELAY - AIR",
          },
          {
            StationId: 642,
            StationName: "PB-UDHAMPUR RELAY - AIR",
          },
          {
            StationId: 648,
            StationName: "PB-ALLEPPY (ALAPPUZHA) HPT - AIR",
          },
          {
            StationId: 653,
            StationName: "PB-AJMER HPT - AIR",
          },
          {
            StationId: 654,
            StationName: "PB-ALIGARH HPT - AIR",
          },
          {
            StationId: 655,
            StationName: "PB-LAKHIMPURKHERI RELAY - AIR",
          },
          {
            StationId: 657,
            StationName: "PB-MUSSOORIE RELAY - AIR",
          },
          {
            StationId: 658,
            StationName: "PB-PITHORAGARH RELAY - AIR",
          },
          {
            StationId: 659,
            StationName: "PB-UTTARKASHI RELAY - AIR",
          },
          {
            StationId: 660,
            StationName: "PB-ASANSOL RELAY - AIR",
          },
          {
            StationId: 662,
            StationName: "PB-VADODARA REGIONAL - AIR",
          },
          {
            StationId: 663,
            StationName: "PB-KANPUR CBS - AIR",
          },
          {
            StationId: 665,
            StationName: "PB-DELHI ZONAL OFFICE(NZ)",
          },
          {
            StationId: 666,
            StationName: "PB-MACHERLA LRS - AIR",
          },
          {
            StationId: 667,
            StationName: "PB-HYDERABAD CBS - AIR",
          },
          {
            StationId: 672,
            StationName: "PB-PATNA CBS - AIR",
          },
          {
            StationId: 673,
            StationName: "PB-CHANDIGARH CBS - AIR",
          },
          {
            StationId: 674,
            StationName: "PB-DELHI CBS - AIR",
          },
          {
            StationId: 676,
            StationName: "PB-AHMEDABAD CBS - AIR",
          },
          {
            StationId: 680,
            StationName: "PB-SRINAGAR CBS - AIR",
          },
          {
            StationId: 682,
            StationName: "PB-BANGALORE CBS - AIR",
          },
          {
            StationId: 686,
            StationName: "PB-THIRUVANANTHAPURAM CBS - AIR",
          },
          {
            StationId: 687,
            StationName: "PB-BHOPAL CBS - AIR",
          },
          {
            StationId: 690,
            StationName: "PB-MUMBAI CBS - AIR",
          },
          {
            StationId: 691,
            StationName: "PB-MUMBAI VBS - AIR",
          },
          {
            StationId: 694,
            StationName: "PB-CUTTACK CBS - AIR",
          },
          {
            StationId: 696,
            StationName: "PB-JAIPUR CBS - AIR",
          },
          {
            StationId: 697,
            StationName: "PB-JODHPUR REGIONAL - AIR",
          },
          {
            StationId: 698,
            StationName: "PB-CHENNAI CBS - AIR",
          },
          {
            StationId: 705,
            StationName: "PB-KOLKATA CBS - AIR",
          },
          {
            StationId: 707,
            StationName: "PB-BANGALORE-CRD MKTG.",
          },
          {
            StationId: 710,
            StationName: "PB-KOLKATA-CRD MKTG. - DD",
          },
          {
            StationId: 712,
            StationName: "PB-KOLKATA DDK - DD",
          },
          {
            StationId: 713,
            StationName: "PB-SHANTINIKATAN DDK - DD",
          },
          {
            StationId: 714,
            StationName: "PB-JALPAIGURI DDK - DD",
          },
          {
            StationId: 715,
            StationName: "PB-PATNA DDK - DD",
          },
          {
            StationId: 716,
            StationName: "PB-MUZAGFFARPUR DDK - DD",
          },
          {
            StationId: 717,
            StationName: "PB-RANCHI DDK - DD",
          },
          {
            StationId: 718,
            StationName: "PB-DALTONGANJ DDK - DD",
          },
          {
            StationId: 719,
            StationName: "PB-BHUBANESWAR DDK - DD",
          },
          {
            StationId: 720,
            StationName: "PB-SAMBALPUR DDK - DD",
          },
          {
            StationId: 721,
            StationName: "PB-BHAWANIPATNA DDK - DD",
          },
          {
            StationId: 722,
            StationName: "PB-SHILLONG DDK - DD",
          },
          {
            StationId: 723,
            StationName: "PB-GUWAHATI PPC DDK - DD",
          },
          {
            StationId: 724,
            StationName: "PB-AIZWAL DDK - DD",
          },
          {
            StationId: 725,
            StationName: "PB-TURA DDK - DD",
          },
          {
            StationId: 726,
            StationName: "PB-KOHIMA DDK - DD",
          },
          {
            StationId: 727,
            StationName: "PB-DIBRUGARH DDK - DD",
          },
          {
            StationId: 728,
            StationName: "PB-IMPHAL DDK - DD",
          },
          {
            StationId: 729,
            StationName: "PB-AGARTALA DDK - DD",
          },
          {
            StationId: 730,
            StationName: "PB-SILCHAR DDK - DD",
          },
          {
            StationId: 731,
            StationName: "PB-GUWAHATI DDK - DD",
          },
          {
            StationId: 732,
            StationName: "PB-GANGTOK DDK - DD",
          },
          {
            StationId: 733,
            StationName: "PB-ITANAGAR DDK - DD",
          },
          {
            StationId: 734,
            StationName: "PB-HISAR DDK - DD",
          },
          {
            StationId: 735,
            StationName: "PB-LEH DDK - DD",
          },
          {
            StationId: 736,
            StationName: "PB-GORAKHPUR DDK - DD",
          },
          {
            StationId: 737,
            StationName: "PB-VARANASI DDK - DD",
          },
          {
            StationId: 738,
            StationName: "PB-DELHI CPC DDK - DD",
          },
          {
            StationId: 739,
            StationName: "PB-SHIMLA DDK - DD",
          },
          {
            StationId: 740,
            StationName: "PB-JALLANDHAR DDK - DD",
          },
          {
            StationId: 741,
            StationName: "PB-BAREILLY DDK - DD",
          },
          {
            StationId: 742,
            StationName: "PB-MATHURA DDK - DD",
          },
          {
            StationId: 743,
            StationName: "PB-CHANDIGARH DDK - DD",
          },
          {
            StationId: 744,
            StationName: "PB-SRINAGAR DDK - DD",
          },
          {
            StationId: 745,
            StationName: "PB-JAIPUR DDK - DD",
          },
          {
            StationId: 746,
            StationName: "PB-MAU DDK - DD",
          },
          {
            StationId: 747,
            StationName: "PB-DEHRADUN DDK - DD",
          },
          {
            StationId: 748,
            StationName: "PB-PATIALA DDK - DD",
          },
          {
            StationId: 749,
            StationName: "PB-JAMMU DDK - DD",
          },
          {
            StationId: 750,
            StationName: "PB-LUCKNOW DDK - DD",
          },
          {
            StationId: 751,
            StationName: "PB-ALLAHABAD DDK - DD",
          },
          {
            StationId: 752,
            StationName: "PB-DELHI DDK - DD",
          },
          {
            StationId: 753,
            StationName: "PB-RAJOURI DDK - DD",
          },
          {
            StationId: 754,
            StationName: "PB-HYDERABAD DDK - DD",
          },
          {
            StationId: 756,
            StationName: "PB-COIMBATORE DDK - DD",
          },
          {
            StationId: 759,
            StationName: "PB-BANGALORE DDK - DD",
          },
          {
            StationId: 760,
            StationName: "PB-MADURAI DDK - DD",
          },
          {
            StationId: 761,
            StationName: "PB-KOZHIKODE/CALICUT DDK - DD",
          },
          {
            StationId: 762,
            StationName: "PB-WARANGAL DDK - DD",
          },
          {
            StationId: 763,
            StationName: "PB-GULBARGA DDK - DD",
          },
          {
            StationId: 764,
            StationName: "PB-PORT BLAIR - DD",
          },
          {
            StationId: 765,
            StationName: "PB-TRIVANDRUM DDK - DD",
          },
          {
            StationId: 766,
            StationName: "PB-CHENNAI DDK - DD",
          },
          {
            StationId: 767,
            StationName: "PB-PONDICHERRY DDK - DD",
          },
          {
            StationId: 768,
            StationName: "PB-NAGPUR DDK - DD",
          },
          {
            StationId: 769,
            StationName: "PB-AHMEDABAD DDK - DD",
          },
          {
            StationId: 770,
            StationName: "PB-PUNE DDK - DD",
          },
          {
            StationId: 771,
            StationName: "PB-MUMBAI DDK - DD",
          },
          {
            StationId: 772,
            StationName: "PB-PANAJI DDK - DD",
          },
          {
            StationId: 773,
            StationName: "PB-RAJKOT DDK - DD",
          },
          {
            StationId: 774,
            StationName: "PB-BHOPAL DDK - DD",
          },
          {
            StationId: 775,
            StationName: "PB-JAGDALPUR DDK - DD",
          },
          {
            StationId: 776,
            StationName: "PB-GWALIOR DDK - DD",
          },
          {
            StationId: 777,
            StationName: "PB-INDORE DDK - DD",
          },
          {
            StationId: 778,
            StationName: "PB-RAIPUR DDK - DD",
          },
          {
            StationId: 779,
            StationName: "PB-ASANSOL HPT - DD",
          },
          {
            StationId: 780,
            StationName: "PB-BALASORE HPT - DD",
          },
          {
            StationId: 781,
            StationName: "PB-BALURGHAT HPT - DD",
          },
          {
            StationId: 782,
            StationName: "PB-BERHAMPUR HPT - DD",
          },
          {
            StationId: 784,
            StationName: "PB-CUTTACK HPT - DD",
          },
          {
            StationId: 786,
            StationName: "PB-JAMSHEDPUR HPT - DD",
          },
          {
            StationId: 787,
            StationName: "PB-KATIHAR HPT - DD",
          },
          {
            StationId: 788,
            StationName: "PB-KHARAGPUR HPT - DD",
          },
          {
            StationId: 790,
            StationName: "PB-KRISHNANAGAR HPT - DD",
          },
          {
            StationId: 791,
            StationName: "PB-KURSEONG HPT - DD",
          },
          {
            StationId: 792,
            StationName: "PB-MURSHIDABAD HPT - DD",
          },
          {
            StationId: 793,
            StationName: "PB-MUZAGFFARPUR HPT - DD",
          },
          {
            StationId: 796,
            StationName: "PB-SAHARSA HPT - DD",
          },
          {
            StationId: 801,
            StationName: "PB-CHURACHANDPUR HPT - DD",
          },
          {
            StationId: 808,
            StationName: "PB-KOKRAJAR HPT - DD",
          },
          {
            StationId: 809,
            StationName: "PB-LUNGLEI HPT - DD",
          },
          {
            StationId: 810,
            StationName: "PB-MOKOKCHUNG HPT - DD",
          },
          {
            StationId: 814,
            StationName: "PB-AGRA HPT - DD",
          },
          {
            StationId: 815,
            StationName: "PB-AJMER HPT - DD",
          },
          {
            StationId: 817,
            StationName: "PB-AMRITSAR HPT - DD",
          },
          {
            StationId: 818,
            StationName: "PB-BANDA HPT - DD",
          },
          {
            StationId: 820,
            StationName: "PB-BARMER HPT - DD",
          },
          {
            StationId: 821,
            StationName: "PB-BHATINDA HPT - DD",
          },
          {
            StationId: 822,
            StationName: "PB-BIKANER HPT - DD",
          },
          {
            StationId: 823,
            StationName: "PB-BUNDI HPT - DD",
          },
          {
            StationId: 824,
            StationName: "PB-DELHI HPT - DD",
          },
          {
            StationId: 825,
            StationName: "PB-DHARMSHALA HPT - DD",
          },
          {
            StationId: 826,
            StationName: "PB-FAIZABAD HPT - DD",
          },
          {
            StationId: 827,
            StationName: "PB-FAZILKA HPT - DD",
          },
          {
            StationId: 829,
            StationName: "PB-GUREJ HPT - DD",
          },
          {
            StationId: 830,
            StationName: "PB-HISAR HPT - DD",
          },
          {
            StationId: 832,
            StationName: "PB-JAISALMER HPT - DD",
          },
          {
            StationId: 833,
            StationName: "PB-JALANDHAR GORAYA HPT - AIR",
          },
          {
            StationId: 836,
            StationName: "PB-JODHPUR HPT - DD",
          },
          {
            StationId: 837,
            StationName: "PB-KANPUR HPT - DD",
          },
          {
            StationId: 838,
            StationName: "PB-KARNAL HPT - DD",
          },
          {
            StationId: 839,
            StationName: "PB-KASAULI HPT - DD",
          },
          {
            StationId: 840,
            StationName: "PB-KATHUA HPT - DD",
          },
          {
            StationId: 841,
            StationName: "PB-KUPWARA HPT - DD",
          },
          {
            StationId: 842,
            StationName: "PB-LAKHIMPUR HPT - DD",
          },
          {
            StationId: 846,
            StationName: "PB-MUSSORIE HPT - DD",
          },
          {
            StationId: 847,
            StationName: "PB-NOWSHERA HPT - DD",
          },
          {
            StationId: 849,
            StationName: "PB-SAMBA HPT - DD",
          },
          {
            StationId: 852,
            StationName: "PB-TITHWAL HPT - DD",
          },
          {
            StationId: 854,
            StationName: "PB-ANANTHAPUR HPT - DD",
          },
          {
            StationId: 857,
            StationName: "PB-CANNANORE HPT - DD",
          },
          {
            StationId: 859,
            StationName: "PB-DHARMAPURI HPT - DD",
          },
          {
            StationId: 860,
            StationName: "PB-DHARWAD HPT - DD",
          },
          {
            StationId: 862,
            StationName: "PB-HASSAN HPT - DD",
          },
          {
            StationId: 864,
            StationName: "PB-KOCHI HPT - DD",
          },
          {
            StationId: 865,
            StationName: "PB-KODAIKANAL HPT - DD",
          },
          {
            StationId: 866,
            StationName: "PB-KUMBHAKONAM HPT - DD",
          },
          {
            StationId: 867,
            StationName: "PB-KURNOOL HPT - DD",
          },
          {
            StationId: 868,
            StationName: "PB-MANGALORE HPT - DD",
          },
          {
            StationId: 869,
            StationName: "PB-MYSURU HPT - DD",
          },
          {
            StationId: 870,
            StationName: "PB-NANDYAL HPT - DD",
          },
          {
            StationId: 873,
            StationName: "PB-RAICHUR HPT - DD",
          },
          {
            StationId: 874,
            StationName: "PB-RAJAMUNDARI HPT - DD",
          },
          {
            StationId: 875,
            StationName: "PB-RAMESHWARAM HPT - DD",
          },
          {
            StationId: 876,
            StationName: "PB-SHIMOGA HPT - DD",
          },
          {
            StationId: 878,
            StationName: "PB-TIRUNELVELI HPT - DD",
          },
          {
            StationId: 881,
            StationName: "PB-VISHAKHAPATNAM HPT - DD",
          },
          {
            StationId: 883,
            StationName: "PB-MEHBOOBNAGAR HPT - DD",
          },
          {
            StationId: 885,
            StationName: "PB-AMBAJOGAI HPT - DD",
          },
          {
            StationId: 886,
            StationName: "PB-AMBIKAPUR HPT - DD",
          },
          {
            StationId: 887,
            StationName: "PB-AURANGABAD HPT - DD",
          },
          {
            StationId: 889,
            StationName: "PB-BHUJ HPT - DD",
          },
          {
            StationId: 890,
            StationName: "PB-BILASPUR HPT - DD",
          },
          {
            StationId: 891,
            StationName: "PB-CHANDRAPUR HPT - DD",
          },
          {
            StationId: 892,
            StationName: "PB-CHHATARPUR HPT - DD",
          },
          {
            StationId: 893,
            StationName: "PB-DWARKA HPT - DD",
          },
          {
            StationId: 894,
            StationName: "PB-GUNA HPT - DD",
          },
          {
            StationId: 897,
            StationName: "PB-JABALPUR HPT - DD",
          },
          {
            StationId: 899,
            StationName: "PB-JALGAON HPT - DD",
          },
          {
            StationId: 900,
            StationName: "PB-MUMBAI CRD",
          },
          {
            StationId: 904,
            StationName: "PB-RADHANPUR HPT - DD",
          },
          {
            StationId: 907,
            StationName: "PB-RATNAGIRI HPT - DD",
          },
          {
            StationId: 908,
            StationName: "PB-SAGAR HPT - DD",
          },
          {
            StationId: 909,
            StationName: "PB-SHAHDOL HPT - DD",
          },
          {
            StationId: 910,
            StationName: "PB-SURAT HPT - DD",
          },
          {
            StationId: 911,
            StationName: "PB-VADODARA HPT - DD",
          },
          {
            StationId: 912,
            StationName: "PB-BALESHWAR DMC - DD",
          },
          {
            StationId: 913,
            StationName: "PB-BARDHAMAN DMC - DD",
          },
          {
            StationId: 914,
            StationName: "PB-BERHAMPUR DMC - DD",
          },
          {
            StationId: 915,
            StationName: "PB-BHAGALPUR DMC - DD",
          },
          {
            StationId: 916,
            StationName: "PB-BHAWANIPATNA DMC - DD",
          },
          {
            StationId: 917,
            StationName: "PB-DARJEELING DMC - DD",
          },
          {
            StationId: 918,
            StationName: "PB-DHANBAD DMC - DD",
          },
          {
            StationId: 919,
            StationName: "PB-DHENKANAL DMC - DD",
          },
          {
            StationId: 920,
            StationName: "PB-GAYA DMC - DD",
          },
          {
            StationId: 921,
            StationName: "PB-HAZARIBAGH DMC - DD",
          },
          {
            StationId: 922,
            StationName: "PB-JAMSHEDPUR DMC - DD",
          },
          {
            StationId: 923,
            StationName: "PB-JEYPORE DMC - DD",
          },
          {
            StationId: 924,
            StationName: "PB-KEONJHARGARH DMC - DD",
          },
          {
            StationId: 925,
            StationName: "PB-MOTIHARI DMC - DD",
          },
          {
            StationId: 926,
            StationName: "PB-PURNEA DMC - DD",
          },
          {
            StationId: 927,
            StationName: "PB-ROURKELA DMC - DD",
          },
          {
            StationId: 928,
            StationName: "PB-SAMBALPUR DMC - DD",
          },
          {
            StationId: 929,
            StationName: "PB-AGARTALA DMC - DD",
          },
          {
            StationId: 930,
            StationName: "PB-DIBRUGARH DMC - DD",
          },
          {
            StationId: 931,
            StationName: "PB-DIMAPUR DMC - DD",
          },
          {
            StationId: 932,
            StationName: "PB-GUWAHATI DMC - DD",
          },
          {
            StationId: 933,
            StationName: "PB-IMPHAL DMC - DD",
          },
          {
            StationId: 934,
            StationName: "PB-ITANAGAR DMC - DD",
          },
          {
            StationId: 935,
            StationName: "PB-JORHAT DMC - DD",
          },
          {
            StationId: 936,
            StationName: "PB-PASSIGHAT DMC - DD",
          },
          {
            StationId: 937,
            StationName: "PB-SILCHAR DMC - DD",
          },
          {
            StationId: 938,
            StationName: "PB-TEZPUR DMC - DD",
          },
          {
            StationId: 939,
            StationName: "PB-ALMORA DMC - DD",
          },
          {
            StationId: 940,
            StationName: "PB-AZAMGARH DMC - DD",
          },
          {
            StationId: 941,
            StationName: "PB-BALRAMPUR(U.P.) DMC - DD",
          },
          {
            StationId: 942,
            StationName: "PB-BAREILLY DMC - DD",
          },
          {
            StationId: 943,
            StationName: "PB-BHILWARA DMC - DD",
          },
          {
            StationId: 944,
            StationName: "PB-BIKANER DMC - DD",
          },
          {
            StationId: 945,
            StationName: "PB-DHARAMSHALA DMC - DD",
          },
          {
            StationId: 946,
            StationName: "PB-ETAH DMC - DD",
          },
          {
            StationId: 947,
            StationName: "PB-FAIZABAD DMC - DD",
          },
          {
            StationId: 948,
            StationName: "PB-HANUMANGARH DMC - DD",
          },
          {
            StationId: 949,
            StationName: "PB-HARIDWAR DMC - DD",
          },
          {
            StationId: 950,
            StationName: "PB-HISAR DMC - DD",
          },
          {
            StationId: 951,
            StationName: "PB-JAMMU (N) DMC - DD",
          },
          {
            StationId: 952,
            StationName: "PB-JAMMU (S) DMC - DD",
          },
          {
            StationId: 953,
            StationName: "PB-JHANSI DMC - DD",
          },
          {
            StationId: 954,
            StationName: "PB-JODHPUR DMC - DD",
          },
          {
            StationId: 955,
            StationName: "PB-KANPUR DMC - DD",
          },
          {
            StationId: 956,
            StationName: "PB-KARGIL DMC - DD",
          },
          {
            StationId: 957,
            StationName: "PB-KARNAL DMC - DD",
          },
          {
            StationId: 958,
            StationName: "PB-KATHUA DMC - DD",
          },
          {
            StationId: 959,
            StationName: "PB-KOTA DMC - DD",
          },
          {
            StationId: 960,
            StationName: "PB-KUPWARA DMC - DD",
          },
          {
            StationId: 961,
            StationName: "PB-LEH (N) DMC - DD",
          },
          {
            StationId: 962,
            StationName: "PB-LEH (S) DMC - DD",
          },
          {
            StationId: 963,
            StationName: "PB-MANDI DMC - DD",
          },
          {
            StationId: 964,
            StationName: "PB-MATHURA DMC - DD",
          },
          {
            StationId: 965,
            StationName: "PB-NAINITAL DMC - DD",
          },
          {
            StationId: 966,
            StationName: "PB-PAHALGAM (ANANTNAG) DMC - DD",
          },
          {
            StationId: 967,
            StationName: "PB-PATHANKOT DMC - DD",
          },
          {
            StationId: 968,
            StationName: "PB-PAURI DMC - DD",
          },
          {
            StationId: 969,
            StationName: "PB-PILANI DMC - DD",
          },
          {
            StationId: 970,
            StationName: "PB-POONCH DMC - DD",
          },
          {
            StationId: 971,
            StationName: "PB-RAJOURI DMC - DD",
          },
          {
            StationId: 972,
            StationName: "PB-RAMPUR (UP) DMC - DD",
          },
          {
            StationId: 973,
            StationName: "PB-SHIMLA DMC - DD",
          },
          {
            StationId: 974,
            StationName: "PB-SRIGANGANAGAR DMC - DD",
          },
          {
            StationId: 975,
            StationName: "PB-SRINAGAR (N) DMC - DD",
          },
          {
            StationId: 976,
            StationName: "PB-SRINAGAR (S) DMC - DD",
          },
          {
            StationId: 977,
            StationName: "PB-UDAIPUR DMC - DD",
          },
          {
            StationId: 978,
            StationName: "PB-UDHAMPUR DMC - DD",
          },
          {
            StationId: 979,
            StationName: "PB-UTTARKASHI DMC - DD",
          },
          {
            StationId: 980,
            StationName: "PB-ADOOR DMC - DD",
          },
          {
            StationId: 981,
            StationName: "PB-BANGALORE DMC - DD",
          },
          {
            StationId: 982,
            StationName: "PB-BELGAUM DMC - DD",
          },
          {
            StationId: 983,
            StationName: "PB-BIJAPUR DMC - DD",
          },
          {
            StationId: 984,
            StationName: "PB-CANNANORE DMC - DD",
          },
          {
            StationId: 985,
            StationName: "PB-COCHIN DMC - DD",
          },
          {
            StationId: 986,
            StationName: "PB-COIMBATORE DMC - DD",
          },
          {
            StationId: 987,
            StationName: "PB-CUDDAPPAH DMC - DD",
          },
          {
            StationId: 988,
            StationName: "PB-DAVANGERE DMC - DD",
          },
          {
            StationId: 989,
            StationName: "PB-GULBARGA DMC - DD",
          },
          {
            StationId: 990,
            StationName: "PB-GUNTUR DMC - DD",
          },
          {
            StationId: 991,
            StationName: "PB-HOSPET DMC - DD",
          },
          {
            StationId: 992,
            StationName: "PB-HYDERABAD DMC - DD",
          },
          {
            StationId: 993,
            StationName: "PB-KARIMNAGAR DMC - DD",
          },
          {
            StationId: 994,
            StationName: "PB-KURNOOL DMC - DD",
          },
          {
            StationId: 995,
            StationName: "PB-MAHBUBNAGAR DMC - DD",
          },
          {
            StationId: 996,
            StationName: "PB-MANGALORE DMC - DD",
          },
          {
            StationId: 997,
            StationName: "PB-MYSURU DMC - DD",
          },
          {
            StationId: 998,
            StationName: "PB-NELLORE DMC - DD",
          },
          {
            StationId: 999,
            StationName: "PB-PONDICHERRY DMC - DD",
          },
          {
            StationId: 1000,
            StationName: "PB-PORT BLAIR(S) DMC - DD",
          },
          {
            StationId: 1001,
            StationName: "PB-PORT BLAIR(N) DMC - DD",
          },
          {
            StationId: 1002,
            StationName: "PB-RAJAHMUNDRY DMC - DD",
          },
          {
            StationId: 1003,
            StationName: "PB-SALEM DMC - DD",
          },
          {
            StationId: 1004,
            StationName: "PB-THANJAVUR DMC - DD",
          },
          {
            StationId: 1005,
            StationName: "PB-THRISSUR DDK - DD",
          },
          {
            StationId: 1006,
            StationName: "PB-TIRUCHIRAPPALLI DMC - DD",
          },
          {
            StationId: 1007,
            StationName: "PB-TIRUNELVELI DMC - DD",
          },
          {
            StationId: 1008,
            StationName: "PB-TRICHUR DMC - DD",
          },
          {
            StationId: 1009,
            StationName: "PB-VELLORE DMC - DD",
          },
          {
            StationId: 1010,
            StationName: "PB-VISHAKAPATNAM DMC - DD",
          },
          {
            StationId: 1011,
            StationName: "PB-WARANGAL DMC - DD",
          },
          {
            StationId: 1012,
            StationName: "PB-AHMEDABAD DMC - DD",
          },
          {
            StationId: 1013,
            StationName: "PB-AKOLA DMC - DD",
          },
          {
            StationId: 1014,
            StationName: "PB-ASHOKNAGAR (GUNA) DMC - DD",
          },
          {
            StationId: 1015,
            StationName: "PB-AURANGABAD DMC - DD",
          },
          {
            StationId: 1016,
            StationName: "PB-BHARUCH DMC - DD",
          },
          {
            StationId: 1017,
            StationName: "PB-BHAVNAGAR DMC - DD",
          },
          {
            StationId: 1018,
            StationName: "PB-BHUSAWAL DMC - DD",
          },
          {
            StationId: 1019,
            StationName: "PB-BILASPUR DMC - DD",
          },
          {
            StationId: 1020,
            StationName: "PB-CHANDRAPUR DMC - DD",
          },
          {
            StationId: 1021,
            StationName: "PB-GWALIOR DMC - DD",
          },
          {
            StationId: 1022,
            StationName: "PB-INDORE DMC - DD",
          },
          {
            StationId: 1023,
            StationName: "PB-ITARSI DMC - DD",
          },
          {
            StationId: 1025,
            StationName: "PB-JAGDALPUR DMC - DD",
          },
          {
            StationId: 1026,
            StationName: "PB-JALGAON DMC - DD",
          },
          {
            StationId: 1027,
            StationName: "PB-KOLHAPUR DMC - DD",
          },
          {
            StationId: 1028,
            StationName: "PB-NAGPUR DMC - DD",
          },
          {
            StationId: 1029,
            StationName: "PB-NANDED DMC - DD",
          },
          {
            StationId: 1030,
            StationName: "PB-NASHIK DMC - DD",
          },
          {
            StationId: 1031,
            StationName: "PB-RAIPUR DMC - DD",
          },
          {
            StationId: 1032,
            StationName: "PB-RAJKOT DMC - DD",
          },
          {
            StationId: 1033,
            StationName: "PB-RATLAM DMC - DD",
          },
          {
            StationId: 1034,
            StationName: "PB-REWA DMC - DD",
          },
          {
            StationId: 1035,
            StationName: "PB-SATARA DMC - DD",
          },
          {
            StationId: 1036,
            StationName: "PB-SHAHDOL DMC - DD",
          },
          {
            StationId: 1037,
            StationName: "PB-SHIVPURI DMC - DD",
          },
          {
            StationId: 1038,
            StationName: "PB-SOLAPUR DMC - DD",
          },
          {
            StationId: 1039,
            StationName: "PB-SURAT DMC - DD",
          },
          {
            StationId: 1040,
            StationName: "PB-VADODARA DMC - DD",
          },
          {
            StationId: 1114,
            StationName: "PB-DHANBAD LRS - AIR",
          },
          {
            StationId: 1356,
            StationName: "PB-KHETIKHAN FM RELAY - AIR",
          },
          {
            StationId: 1360,
            StationName: "PB-PITHORAGARH RELAY - AIR",
          },
          {
            StationId: 1457,
            StationName: "PB-HARIDWAR RELAY - AIR",
          },
          {
            StationId: 1610,
            StationName: "PB-SUNDERNAGAR RELAY - AIR",
          },
          {
            StationId: 1641,
            StationName: "PB-RANIKHET FM RELAY - AIR",
          },
          {
            StationId: 1726,
            StationName: "PB-RAMPUR (HP) RELAY - AIR",
          },
          {
            StationId: 1798,
            StationName: "PB-PUNALUR RELAY -AIR",
          },
          {
            StationId: 2346,
            StationName: "PB-SAGAR DMC - DD",
          },
          {
            StationId: 2396,
            StationName: "PB-CHENNAI ZONAL OFFICE(SZ)",
          },
          {
            StationId: 2397,
            StationName: "PB-MUMBAI ZONAL OFFICE(WZ)",
          },
          {
            StationId: 2398,
            StationName: "PB-KOLKATA ZONAL OFFICE(EZ)",
          },
          {
            StationId: 2401,
            StationName: "PB-GUWAHATI ZONAL OFFICE(NEZ)",
          },
          {
            StationId: 2402,
            StationName: "PB-AMRAVATI SLRS - AIR",
          },
          {
            StationId: 2405,
            StationName: "PB-BANGALORE SPT - AIR",
          },
          {
            StationId: 2406,
            StationName: "PB-BHUBANESWAR NABM",
          },
          {
            StationId: 2407,
            StationName: "PB-BRAHMAVAR RELAY - AIR",
          },
          {
            StationId: 2408,
            StationName: "PB-CHENNAI AVADI HPT HPT - AIR",
          },
          {
            StationId: 2409,
            StationName: "PB-CHINSURAH SPT SPT - AIR",
          },
          {
            StationId: 2410,
            StationName: "PB-DELHI CEN. STORES - AIR",
          },
          {
            StationId: 2412,
            StationName: "PB-DELHI P & D UNIT - AIR",
          },
          {
            StationId: 2413,
            StationName: "PB-DUNGARPUR SLRS - AIR",
          },
          {
            StationId: 2414,
            StationName: "PB-MUMBAI MALAD HPT HPT - AIR",
          },
          {
            StationId: 2416,
            StationName: "PB-NAGPUR SPT - AIR",
          },
          {
            StationId: 2417,
            StationName: "PB-OBRA LRS - AIR",
          },
          {
            StationId: 2418,
            StationName: "PB-PANAJI HPT - AIR",
          },
          {
            StationId: 2419,
            StationName: "PB-RAJKOT SPT SPT - AIR",
          },
          {
            StationId: 2424,
            StationName: "PB-DELHI CP&S - DD",
          },
          {
            StationId: 2425,
            StationName: "PB-DELHI DG:DD - DD",
          },
          {
            StationId: 2426,
            StationName: "PB-DELHI EARTH STATION - DD",
          },
          {
            StationId: 2427,
            StationName: "PB-DELHI NEWS - DD",
          },
          {
            StationId: 2430,
            StationName: "PB-DELHI CE-LEVEL-I - CCW",
          },
          {
            StationId: 2431,
            StationName: "PB-DELHI SE(C)-II - CCW",
          },
          {
            StationId: 2432,
            StationName: "PB-MUMBAI SE(C)- CCW",
          },
          {
            StationId: 2433,
            StationName: "PB-CHENNAI SE(C)- CCW",
          },
          {
            StationId: 2434,
            StationName: "PB-KOLKATA SE(C)- CCW",
          },
          {
            StationId: 2435,
            StationName: "PB-GUWAHATI SE(C)- CCW",
          },
          {
            StationId: 2436,
            StationName: "PB-NAGPUR SE(E)- CCW",
          },
          {
            StationId: 2438,
            StationName: "PB-KOLKATA SE(E)- CCW",
          },
          {
            StationId: 2439,
            StationName: "PB-JAIPUR EE(C)- CCW",
          },
          {
            StationId: 2440,
            StationName: "PB-CHANDIGARH EE(C)- CCW",
          },
          {
            StationId: 2441,
            StationName: "PB-GUWAHATI EE(C)- CCW",
          },
          {
            StationId: 2443,
            StationName: "PB-KOLKATA EE(C)- CCW",
          },
          {
            StationId: 2444,
            StationName: "PB-BHUBANESWAR EE(C)- CCW",
          },
          {
            StationId: 2445,
            StationName: "PB-SILIGURI EE(C)- CCW",
          },
          {
            StationId: 2446,
            StationName: "PB-PATNA EE(C)- CCW",
          },
          {
            StationId: 2447,
            StationName: "PB-BHOPAL EE(C)- CCW",
          },
          {
            StationId: 2449,
            StationName: "PB-MUMBAI EE(C)- CCW",
          },
          {
            StationId: 2450,
            StationName: "PB-VADODARA EE(C) - CCW",
          },
          {
            StationId: 2451,
            StationName: "PB-CHENNAI EE(C)- CCW",
          },
          {
            StationId: 2452,
            StationName: "PB-BANGALORE EE(C)- CCW",
          },
          {
            StationId: 2453,
            StationName: "PB-KOCHI EE(C)- CCW",
          },
          {
            StationId: 2454,
            StationName: "PB-HYDERABAD EE(C)- CCW",
          },
          {
            StationId: 2455,
            StationName: "PB-JAMMU EE(C)- CCW",
          },
          {
            StationId: 2456,
            StationName: "PB-LUCKNOW EE(C)- CCW",
          },
          {
            StationId: 2457,
            StationName: "PB-PUNE EE(C)- CCW",
          },
          {
            StationId: 2458,
            StationName: "PB-DELHI EE(E) DIVISION-I - CCW",
          },
          {
            StationId: 2459,
            StationName: "PB-PATNA EE(E)- CCW",
          },
          {
            StationId: 2460,
            StationName: "PB-GUWAHATI EE(E)- CCW",
          },
          {
            StationId: 2461,
            StationName: "PB-KOLKATA EE(E)- CCW",
          },
          {
            StationId: 2462,
            StationName: "PB-CHENNAI EE(E)- CCW",
          },
          {
            StationId: 2463,
            StationName: "PB-NAGPUR EE(E)- CCW",
          },
          {
            StationId: 2557,
            StationName: "PB-GWALIOR REGIONAL - AIR",
          },
          {
            StationId: 2558,
            StationName: "PB-UJJAIN SLRS - AIR",
          },
          {
            StationId: 2559,
            StationName: "PB-JUNAGARH LRS - AIR",
          },
          {
            StationId: 2564,
            StationName: "PB-GONDIA RELAY - AIR",
          },
          {
            StationId: 2571,
            StationName: "PB-DHARMANAGAR SLRS - AIR",
          },
          {
            StationId: 2572,
            StationName: "PB-TIRUPATI DDK - DD",
          },
          {
            StationId: 2573,
            StationName: "PB-VIJAYWADA DDK - DD",
          },
          {
            StationId: 2576,
            StationName: "PB-AMETHI SLRS - AIR",
          },
          {
            StationId: 2577,
            StationName: "PB-GAIRSAIN RELAY - AIR",
          },
          {
            StationId: 2578,
            StationName: "PB-DEHRADUN CAPITAL ST - AIR",
          },
          {
            StationId: 2585,
            StationName: "PB-RAEBARELI SLRS - AIR",
          },
          {
            StationId: 2586,
            StationName: "PB-UDHAGAMANDALAM (OOTY) LRS - AIR",
          },
          {
            StationId: 2587,
            StationName: "PB-DELHI ESD - AIR",
          },
          {
            StationId: 2589,
            StationName: "PB-MUMBAI CSU MKTG. - AIR",
          },
          {
            StationId: 2592,
            StationName: null,
          },
          {
            StationId: 2593,
            StationName: "PB-SHILLONG RABM",
          },
          {
            StationId: 2596,
            StationName: "PB-BANDA RELAY - AIR",
          },
          {
            StationId: 2597,
            StationName: "PB-BAGESHWAR SLRS - AIR",
          },
          {
            StationId: 2598,
            StationName: "PB-LUDHIANA SLRS - AIR",
          },
          {
            StationId: 2599,
            StationName: "PB-NEW TEHRI RELAY - AIR",
          },
          {
            StationId: 2617,
            StationName: "PB-MAU NATH BHANJAN RELAY - AIR",
          },
          {
            StationId: 2633,
            StationName: "PB-KOLKATA EAST ZONE ARCHIVES",
          },
          {
            StationId: 2635,
            StationName: "PB-DELHI PRASAR BHARATI ARCHIVES",
          },
          {
            StationId: 2636,
            StationName: "PB-DELHI DCS - DD",
          },
          {
            StationId: 2638,
            StationName: "PB-DELHI-CRD MKTG. - AIR",
          },
          {
            StationId: 2640,
            StationName: null,
          },
          {
            StationId: 2642,
            StationName: "PB-DELHI SE(C)-I - CCW",
          },
          {
            StationId: 2644,
            StationName: "PB-DELHI SE(C)-III - CCW",
          },
          {
            StationId: 2651,
            StationName: "PB-DELHI EE(C) SOOCHNA BHAWAN PROJECT DIVISION-CCW",
          },
          {
            StationId: 2657,
            StationName: "PB-DELHI EE(C) MANDI HOUSE PROJECT DIVISION- CCW",
          },
          {
            StationId: 2660,
            StationName: "PB-DELHI EE(C) SOOCHNA BHAWAN- CCW",
          },
          {
            StationId: 2665,
            StationName: "PB-DELHI EE(C) METRO DIVISION-I- CCW",
          },
          {
            StationId: 2666,
            StationName: "PB-DELHI EE(C) METRO DIVISION-II- CCW",
          },
          {
            StationId: 2672,
            StationName: "PB-DELHI EE(E) DIVISION-II- CCW",
          },
          {
            StationId: 2673,
            StationName: "PB-DELHI EE(E) METRO- CCW",
          },
          {
            StationId: 2674,
            StationName: "PB-DELHI SE(E) - CCW",
          },
          {
            StationId: 2693,
            StationName: "PB-CHANDIGARH EE(E)- CCW",
          },
          {
            StationId: 2719,
            StationName: "PB-MUMBAI EE(E)- CCW",
          },
          {
            StationId: 2725,
            StationName: "PB-BANGALORE EE(E)- CCW",
          },
          {
            StationId: 2728,
            StationName: "PB-ITANAGAR EE(C)- CCW",
          },
          {
            StationId: 2729,
            StationName: "PB-SILCHAR EE(C)- CCW",
          },
          {
            StationId: 2734,
            StationName: "PB-MUMBAI ADG(P) (WR-I & II)",
          },
          {
            StationId: 2735,
            StationName: "PB-KOLKATA ADG(P)(ER)",
          },
          {
            StationId: 2736,
            StationName: "PB-AHMEDABAD RABM(P)",
          },
          {
            StationId: 2737,
            StationName: "PB-CHENNAI SOUTH ZONE ARCHIVES",
          },
          {
            StationId: 2738,
            StationName: "PB-MUMBAI WEST ZONE ARCHIVES",
          },
          {
            StationId: 2739,
            StationName: "PB-GUWAHATI NORTH EAST ZONE ARCHIVES",
          },
          {
            StationId: 2740,
            StationName: "PB-RAIRANGPUR SLRS - AIR",
          },
          {
            StationId: 2743,
            StationName: "PB-BHUBANESWAR NABM",
          },
          {
            StationId: 2744,
            StationName: "PB-LUCKNOW ADG(P) (CR-I)",
          },
          {
            StationId: 2745,
            StationName: "PB-BHOPAL ADG(P)(CR-II)",
          },
          {
            StationId: 2746,
            StationName: "PB-GUWAHATI ADG(P) (NER-I & II)",
          },
          {
            StationId: 2747,
            StationName: "PB-SHILLONG RABM",
          },
          {
            StationId: 2748,
            StationName: null,
          },
          {
            StationId: 2749,
            StationName: null,
          },
          {
            StationId: 2750,
            StationName: "PB-THIRUVANANTHAPURAM RABM(P)",
          },
          {
            StationId: 2751,
            StationName: "PB-CHENNAI ADG(P) (SR-I )",
          },
          {
            StationId: 2752,
            StationName: "PB-BANGALORE ADG(P) (SR-II )",
          },
          {
            StationId: 2753,
            StationName: "PB-POONCH HPT - DD",
          },
          {
            StationId: 2755,
            StationName: null,
          },
          {
            StationId: 2756,
            StationName: "PB-AMRITSAR RELAY - AIR",
          },
          {
            StationId: 3757,
            StationName: "PB-BALRAMPUR RELAY - AIR",
          },
          {
            StationId: 3758,
            StationName: null,
          },
          {
            StationId: 3759,
            StationName: "PB-SHILLONG NORTH EASTERN SERVICE REGIONAL - AIR",
          },
          {
            StationId: 3760,
            StationName: "PB-DELHI PAO - AIR",
          },
          {
            StationId: 3761,
            StationName: "PB-DELHI PAO - DD",
          },
          {
            StationId: 3762,
            StationName: "PB-KOLKATA PAO - AIR",
          },
          {
            StationId: 3763,
            StationName: "PB-MUMBAI PAO - AIR",
          },
          {
            StationId: 3764,
            StationName: "PB-CHENNAI PAO - AIR",
          },
          {
            StationId: 3765,
            StationName: "PB-GUWAHATI PAO - DD",
          },
          {
            StationId: 3766,
            StationName: "PB-PAO IRLA",
          },
          {
            StationId: 3768,
            StationName: "PB-DOPARJIO LRS - AIR",
          },
          {
            StationId: 3769,
            StationName: null,
          },
          {
            StationId: 3773,
            StationName: "PB-KAYAMKULAM RELAY - AIR",
          },
          {
            StationId: 3774,
            StationName: "PB-GANGAVATHI RELAY - AIR",
          },
          {
            StationId: 3775,
            StationName: "PB-DELHI PRASAR BHARATI SECTT.",
          },
          {
            StationId: 3776,
            StationName: "PB-NELLORE SLRS - AIR",
          },
          {
            StationId: 3777,
            StationName: "PB-FAZILKA RELAY - AIR",
          },
          {
            StationId: 3780,
            StationName: "PB-GURDASPUR RELAY - AIR",
          },
          {
            StationId: 3781,
            StationName: "PB-FIROZPUR RELAY - AIR",
          },
          {
            StationId: 3782,
            StationName: "PB-NATHATOP RELAY - AIR",
          },
          {
            StationId: 3783,
            StationName: "PB-NARKATIYAGANJ  RELAY - AIR",
          },
          {
            StationId: 3784,
            StationName: "PB-MEERUT LRS - AIR",
          },
          {
            StationId: 3786,
            StationName: "PB-RATLAM LRS - AIR",
          },
          {
            StationId: 3787,
            StationName: "PB-GODDA RELAY - AIR",
          },
          {
            StationId: 3788,
            StationName: "PB-GHATSILA RELAY - AIR",
          },
          {
            StationId: 3819,
            StationName: "PB-MOHANA RELAY - AIR",
          },
          {
            StationId: 3820,
            StationName: "PB-GAYA RELAY - AIR",
          },
          {
            StationId: 3821,
            StationName: "PB-AURANGABAD RELAY - AIR",
          },
          {
            StationId: 3822,
            StationName: "PB-BETTIAH RELAY - AIR",
          },
          {
            StationId: 3823,
            StationName: "PB-MOTIHARI RELAY - AIR",
          },
          {
            StationId: 3824,
            StationName: "PB-SAHARSA RELAY - AIR",
          },
          {
            StationId: 3825,
            StationName: "PB-GUMLA RELAY - AIR",
          },
          {
            StationId: 3826,
            StationName: "PB-BOKARO RELAY - AIR",
          },
          {
            StationId: 3827,
            StationName: "PB-GIRIDIH RELAY - AIR",
          },
          {
            StationId: 3828,
            StationName: "PB-DEOGHAR RELAY - AIR",
          },
          {
            StationId: 3829,
            StationName: "PB-DUMKA RELAY - AIR",
          },
          {
            StationId: 3830,
            StationName: "PB-DEOGARH RELAY - AIR",
          },
          {
            StationId: 3831,
            StationName: "PB-SUNDARGARH RELAY - AIR",
          },
          {
            StationId: 3832,
            StationName: "PB-ANGUL RELAY - AIR",
          },
          {
            StationId: 3833,
            StationName: "PB-PARADEEP RELAY - AIR",
          },
          {
            StationId: 3834,
            StationName: "PB-PARLEKHAMUNDI RELAY - AIR",
          },
          {
            StationId: 3835,
            StationName: "PB-BALIGUDA RELAY - AIR",
          },
          {
            StationId: 3836,
            StationName: "PB-RAYAGADA RELAY - AIR",
          },
          {
            StationId: 3837,
            StationName: "PB-NUAPADA RELAY - AIR",
          },
          {
            StationId: 3838,
            StationName: "PB-KHARAGPUR RELAY - AIR",
          },
          {
            StationId: 3839,
            StationName: "PB-DARJEELING RELAY - AIR",
          },
          {
            StationId: 3840,
            StationName: "PB-PURULIA RELAY - AIR",
          },
          {
            StationId: 3841,
            StationName: "PB-FARAKKA RELAY - AIR",
          },
          {
            StationId: 3842,
            StationName: "PB-MALDA RELAY - AIR",
          },
          {
            StationId: 3843,
            StationName: "PB-CHATRA RELAY - AIR",
          },
          {
            StationId: 3844,
            StationName: "PB-ALIPURDUAR RELAY - AIR",
          },
          {
            StationId: 3845,
            StationName: "PB-BANKA RELAY - AIR",
          },
          {
            StationId: 3846,
            StationName: "PB-BARHARWA RELAY - AIR",
          },
          {
            StationId: 3847,
            StationName: "PB-BARGARH RELAY - AIR",
          },
          {
            StationId: 3848,
            StationName: "PB-BEGUSARAI RELAY - AIR",
          },
          {
            StationId: 3849,
            StationName: "PB-BUXAR RELAY - AIR",
          },
          {
            StationId: 3850,
            StationName: "PB-JAMUI RELAY - AIR",
          },
          {
            StationId: 3851,
            StationName: "PB-KENDRAPARA RELAY - AIR",
          },
          {
            StationId: 3852,
            StationName: "PB-KORAPUT RELAY - AIR",
          },
          {
            StationId: 3853,
            StationName: "PB-KATIHAR RELAY - AIR",
          },
          {
            StationId: 3854,
            StationName: "PB-LAKHISARAI RELAY - AIR",
          },
          {
            StationId: 3855,
            StationName: "PB-LOHARDAGA RELAY - AIR",
          },
          {
            StationId: 3856,
            StationName: "PB-MALKANGIRI RELAY - AIR",
          },
          {
            StationId: 3857,
            StationName: "PB-NAVARANGPUR RELAY - AIR",
          },
          {
            StationId: 3858,
            StationName: "PB-NAWADA RELAY - AIR",
          },
          {
            StationId: 3859,
            StationName: "PB-PHULBANI RELAY - AIR",
          },
          {
            StationId: 3860,
            StationName: "PB-SIKANDRA RELAY - AIR",
          },
          {
            StationId: 3861,
            StationName: "PB-SHEIKHPURA RELAY - AIR",
          },
          {
            StationId: 3862,
            StationName: "PB-SITAMARHI RELAY - AIR",
          },
          {
            StationId: 3863,
            StationName: "PB-ANUPGARH RELAY - AIR",
          },
          {
            StationId: 3864,
            StationName: "PB-AURAIYA RELAY - AIR",
          },
          {
            StationId: 3865,
            StationName: "PB-BACHER (GOPESHWAR) RELAY - AIR",
          },
          {
            StationId: 3866,
            StationName: "PB-BAHRAICH RELAY - AIR",
          },
          {
            StationId: 3867,
            StationName: "PB-BARAN RELAY - AIR",
          },
          {
            StationId: 3868,
            StationName: "PB-BERTHEIN RELAY - AIR",
          },
          {
            StationId: 3869,
            StationName: "PB-BHADRA RELAY - AIR",
          },
          {
            StationId: 3871,
            StationName: "PB-BHATWARI RELAY - AIR",
          },
          {
            StationId: 3872,
            StationName: "PB-BHILWARA RELAY - AIR",
          },
          {
            StationId: 3873,
            StationName: "PB-BHINMAL RELAY - AIR",
          },
          {
            StationId: 3874,
            StationName: "PB-BHIWANI RELAY - AIR",
          },
          {
            StationId: 3875,
            StationName: "PB-BILASPUR RELAY - AIR",
          },
          {
            StationId: 3878,
            StationName: "PB-FATEHPUR RELAY - AIR",
          },
          {
            StationId: 3879,
            StationName: "PB-HANUMANGARH RELAY - AIR",
          },
          {
            StationId: 3880,
            StationName: "PB-HARDOI RELAY - AIR",
          },
          {
            StationId: 3881,
            StationName: "PB-JALORE RELAY - AIR",
          },
          {
            StationId: 3882,
            StationName: "PB-JIND RELAY - AIR",
          },
          {
            StationId: 3883,
            StationName: "PB-KALAGARH RELAY - AIR",
          },
          {
            StationId: 3884,
            StationName: "PB-KARANPUR RELAY - AIR",
          },
          {
            StationId: 3886,
            StationName: "PB-KARVI RELAY - AIR",
          },
          {
            StationId: 3887,
            StationName: "PB-KASHIPUR RELAY - AIR",
          },
          {
            StationId: 3888,
            StationName: "PB-KEYLONG RELAY - AIR",
          },
          {
            StationId: 3889,
            StationName: "PB-KHAJUWALA RELAY - AIR",
          },
          {
            StationId: 3890,
            StationName: "PB-MANALI RELAY - AIR",
          },
          {
            StationId: 3891,
            StationName: "PB-MANDI RELAY - AIR",
          },
          {
            StationId: 3892,
            StationName: "PB-NAINITAL RELAY - AIR",
          },
          {
            StationId: 3893,
            StationName: "PB-NATHDWARA RELAY - AIR",
          },
          {
            StationId: 3894,
            StationName: "PB-NAUGARH RELAY - AIR",
          },
          {
            StationId: 3895,
            StationName: "PB-OKHIMATH RELAY - AIR",
          },
          {
            StationId: 3896,
            StationName: "PB-ORAI RELAY - AIR",
          },
          {
            StationId: 3897,
            StationName: "PB-PHALODI RELAY - AIR",
          },
          {
            StationId: 3898,
            StationName: "PB-PRATAPGARH RELAY - AIR",
          },
          {
            StationId: 3899,
            StationName: "PB-PRATAPNAGAR RELAY - AIR",
          },
          {
            StationId: 3900,
            StationName: "PB-RAJGARHI RELAY - AIR",
          },
          {
            StationId: 3901,
            StationName: "PB-SIRSA RELAY - AIR",
          },
          {
            StationId: 3902,
            StationName: "PB-SUJANGARH RELAY - AIR",
          },
          {
            StationId: 3903,
            StationName: "PB-TANAKPUR RELAY - AIR",
          },
          {
            StationId: 3905,
            StationName: "PB-BUNDI RELAY - AIR",
          },
          {
            StationId: 3906,
            StationName: "PB-KOTPUTLI RELAY - AIR",
          },
          {
            StationId: 3907,
            StationName: "PB-HALDWANI RELAY - AIR",
          },
          {
            StationId: 3908,
            StationName: "PB-KRISHNANAGAR RELAY - AIR\r\n",
          },
          {
            StationId: 3909,
            StationName: "PB-ADONI RELAY - AIR",
          },
          {
            StationId: 3910,
            StationName: "PB-KAKINADA RELAY - AIR",
          },
          {
            StationId: 3911,
            StationName: "PB-NANDYAL RELAY - AIR",
          },
          {
            StationId: 3912,
            StationName: "PB-ONGOLE RELAY - AIR",
          },
          {
            StationId: 3913,
            StationName: "PB-BANSWADA RELAY - AIR",
          },
          {
            StationId: 3914,
            StationName: "PB-KAMAREDDY RELAY - AIR",
          },
          {
            StationId: 3915,
            StationName: "PB-KHAMMAM RELAY - AIR",
          },
          {
            StationId: 3917,
            StationName: "PB-HOSADURGA RELAY - AIR",
          },
          {
            StationId: 3918,
            StationName: "PB-KUMTA RELAY - AIR",
          },
          {
            StationId: 3919,
            StationName: "PB-SAGAR(KARNATAKA) RELAY - AIR",
          },
          {
            StationId: 3920,
            StationName: "PB-SRINGERI RELAY - AIR",
          },
          {
            StationId: 3921,
            StationName: "PB-TUMKUR RELAY - AIR",
          },
          {
            StationId: 3922,
            StationName: "PB-IDUKKI RELAY - AIR",
          },
          {
            StationId: 3923,
            StationName: "PB-KALPETTA RELAY - AIR",
          },
          {
            StationId: 3924,
            StationName: "PB-RAMESWARAM RELAY - AIR",
          },
          {
            StationId: 3926,
            StationName: "PB-YERCAUD RELAY - AIR",
          },
          {
            StationId: 3929,
            StationName: "PB-ALAGADDA RELAY - AIR",
          },
          {
            StationId: 3930,
            StationName: "PB-BAGALKOT RELAY - AIR",
          },
          {
            StationId: 3931,
            StationName: "PB-BIDAR RELAY - AIR",
          },
          {
            StationId: 3932,
            StationName: "PB-KOLAR RELAY - AIR",
          },
          {
            StationId: 3933,
            StationName: "PB-RENEBENUR RELAY - AIR",
          },
          {
            StationId: 3934,
            StationName: "PB-PATHANATHITTA RELAY - AIR",
          },
          {
            StationId: 3935,
            StationName: "PB-DAVARGONDA RELAY - AIR",
          },
          {
            StationId: 3936,
            StationName: "PB-NALGONDA RELAY - AIR",
          },
          {
            StationId: 3937,
            StationName: "PB-RAMAGUNDAM RELAY - AIR",
          },
          {
            StationId: 3938,
            StationName: "PB-SIPUR RELAY - AIR",
          },
          {
            StationId: 3939,
            StationName: "PB-RAJAMAHENDRAVARAM\r\n RELAY - AIR",
          },
          {
            StationId: 3941,
            StationName: "PB-BALURGHAT RELAY - AIR",
          },
          {
            StationId: 3942,
            StationName: "PB-MUZAFFARPUR RELAY - AIR",
          },
          {
            StationId: 3945,
            StationName: "PB-NAZIRA RELAY - AIR",
          },
          {
            StationId: 3953,
            StationName: "PB-DWARKA RELAY - AIR",
          },
          {
            StationId: 3954,
            StationName: "PB-AMRELI RELAY - AIR",
          },
          {
            StationId: 3955,
            StationName: "PB-BHARUCH RELAY - AIR",
          },
          {
            StationId: 3956,
            StationName: "PB-BHAVNAGAR RELAY - AIR",
          },
          {
            StationId: 3957,
            StationName: "PB-BRAMHAPURI RELAY - AIR",
          },
          {
            StationId: 3958,
            StationName: "PB-BULDHANA RELAY - AIR",
          },
          {
            StationId: 3959,
            StationName: "PB-CHANDERI RELAY - AIR",
          },
          {
            StationId: 3960,
            StationName: "PB-DIU RELAY - AIR",
          },
          {
            StationId: 3961,
            StationName: "PB-DONGARGARH RELAY - AIR",
          },
          {
            StationId: 3962,
            StationName: "PB-GADCHIROLI RELAY - AIR",
          },
          {
            StationId: 3963,
            StationName: "PB-HARDA RELAY - AIR",
          },
          {
            StationId: 3964,
            StationName: "PB-JALNA RELAY - AIR",
          },
          {
            StationId: 3965,
            StationName: "PB-JAMNAGAR RELAY - AIR",
          },
          {
            StationId: 3966,
            StationName: "PB-JHABUA RELAY - AIR",
          },
          {
            StationId: 3967,
            StationName: "PB-KANKER RELAY - AIR",
          },
          {
            StationId: 3968,
            StationName: "PB-KHAROD RELAY - AIR",
          },
          {
            StationId: 3969,
            StationName: "PB-KONTA RELAY - AIR",
          },
          {
            StationId: 3970,
            StationName: "PB-KORBA RELAY - AIR",
          },
          {
            StationId: 3971,
            StationName: "PB-MANENDARGARH RELAY - AIR",
          },
          {
            StationId: 3972,
            StationName: "PB-MEHASANA RELAY - AIR",
          },
          {
            StationId: 3973,
            StationName: "PB-NEEMUCH RELAY - AIR",
          },
          {
            StationId: 3974,
            StationName: "PB-PANCHMARHI RELAY - AIR",
          },
          {
            StationId: 3975,
            StationName: "PB-PORBANDAR RELAY - AIR",
          },
          {
            StationId: 3976,
            StationName: "PB-SATNA (REWA) RELAY - AIR",
          },
          {
            StationId: 3977,
            StationName: "PB-SHIRDI RELAY - AIR",
          },
          {
            StationId: 3978,
            StationName: "PB-KEVADIA COLONY RELAY - AIR",
          },
          {
            StationId: 3979,
            StationName: "PB-NARAYANPUR RELAY - AIR",
          },
          {
            StationId: 3980,
            StationName: "PB-BAILADILA RELAY - AIR",
          },
          {
            StationId: 3981,
            StationName: "PB-RAJHARA RELAY - AIR",
          },
          {
            StationId: 3982,
            StationName: "PB-BOTAD RELAY - AIR",
          },
          {
            StationId: 3983,
            StationName: "PB-RAPAR RELAY - AIR",
          },
          {
            StationId: 3984,
            StationName: "PB-SURENDRANAGAR RELAY - AIR",
          },
          {
            StationId: 3985,
            StationName: "PB-VERAVAL RELAY - AIR",
          },
          {
            StationId: 3986,
            StationName: "PB-KHAMBALIA RELAY - AIR",
          },
          {
            StationId: 3987,
            StationName: "PB-THARAD RELAY - AIR",
          },
          {
            StationId: 3988,
            StationName: "PB-MODASSA RELAY - AIR",
          },
          {
            StationId: 3989,
            StationName: "PB-RADHANPUR RELAY - AIR",
          },
          {
            StationId: 3990,
            StationName: "PB-VALSAD RELAY - AIR",
          },
          {
            StationId: 3991,
            StationName: "PB-DAHOD RELAY - AIR",
          },
          {
            StationId: 3992,
            StationName: "PB-BARWANI RELAY - AIR",
          },
          {
            StationId: 3993,
            StationName: "PB-KUKDESHWAR RELAY - AIR",
          },
          {
            StationId: 3994,
            StationName: "PB-SHAJAPUR RELAY - AIR",
          },
          {
            StationId: 3995,
            StationName: "PB-NAGADA RELAY - AIR",
          },
          {
            StationId: 3996,
            StationName: "PB-DAMOH RELAY - AIR",
          },
          {
            StationId: 3997,
            StationName: "PB-MURWARA(KATNI) RELAY - AIR",
          },
          {
            StationId: 3998,
            StationName: "PB-NARSINGPUR RELAY - AIR",
          },
          {
            StationId: 3999,
            StationName: "PB-KURWAI RELAY - AIR",
          },
          {
            StationId: 4000,
            StationName: "PB-PANNA RELAY - AIR",
          },
          {
            StationId: 4001,
            StationName: "PB-PIPARIA RELAY - AIR",
          },
          {
            StationId: 4002,
            StationName: "PB-SEONI RELAY - AIR",
          },
          {
            StationId: 4003,
            StationName: "PB-BURHANPUR RELAY - AIR",
          },
          {
            StationId: 4004,
            StationName: "PB-SHEOPURKALAN RELAY - AIR",
          },
          {
            StationId: 4005,
            StationName: "PB-ACHALPUR RELAY - AIR",
          },
          {
            StationId: 4006,
            StationName: "PB-WASHIM RELAY - AIR",
          },
          {
            StationId: 4007,
            StationName: "PB-HINGOLI RELAY - AIR",
          },
          {
            StationId: 4008,
            StationName: "PB-NANDURBAR RELAY - AIR",
          },
          {
            StationId: 4009,
            StationName: "PB-SATANA RELAY - AIR",
          },
          {
            StationId: 4010,
            StationName: "PB-AHERI RELAY - AIR",
          },
          {
            StationId: 4011,
            StationName: "PB-SIRONCHA RELAY - AIR",
          },
          {
            StationId: 4012,
            StationName: "PB-AJMER RELAY - AIR",
          },
          {
            StationId: 4013,
            StationName: "PB-COOCHBIHAR RELAY - AIR",
          },
          {
            StationId: 4014,
            StationName: "PB-GADANIA RELAY - AIR",
          },
          {
            StationId: 4015,
            StationName: "PB-BATHNAHA RELAY - AIR",
          },
          {
            StationId: 4016,
            StationName: "PB-KISHANGANJ RELAY - AIR",
          },
          {
            StationId: 4017,
            StationName: "PB-AMBIKAPUR RELAY - AIR",
          },
          {
            StationId: 4018,
            StationName: "PB-ETAWAH RELAY - AIR",
          },
          {
            StationId: 4019,
            StationName: "PB-NANPARA RELAY - AIR",
          },
          {
            StationId: 4020,
            StationName: "PB-LALITPUR RELAY - AIR",
          },
          {
            StationId: 4021,
            StationName: "PB-MAHOBA RELAY - AIR",
          },
          {
            StationId: 4022,
            StationName: "PB-SULTANPUR RELAY - AIR",
          },
          {
            StationId: 4023,
            StationName: "PB-SILVASSA RELAY - AIR",
          },
          {
            StationId: 4024,
            StationName: "PB-AHWA RELAY - AIR",
          },
          {
            StationId: 4025,
            StationName: "PB-CHHATARPUR RELAY - AIR",
          },
          {
            StationId: 4027,
            StationName: "PB-URI RELAY - AIR",
          },
          {
            StationId: 4028,
            StationName: "PB-HAMBOTINGLA RELAY - AIR",
          },
          {
            StationId: 4029,
            StationName: "PB-PAHALGAM RELAY - AIR",
          },
          {
            StationId: 4031,
            StationName: "PB-CHOHTAN HILL RELAY - AIR",
          },
          {
            StationId: 4032,
            StationName: "PB-MADHUBANI RELAY - AIR",
          },
          {
            StationId: 4033,
            StationName: "PB-BASANTI RELAY - AIR",
          },
          {
            StationId: 4034,
            StationName: "PB-BARDHAMAN RELAY - AIR",
          },
          {
            StationId: 4035,
            StationName: "PB-PAURI RELAY - AIR",
          },
          {
            StationId: 4041,
            StationName: "PB-PANDRIA(CG) RELAY - AIR",
          },
          {
            StationId: 4042,
            StationName: "PB-DEESA RELAY - AIR",
          },
          {
            StationId: 4043,
            StationName: "PB-GOALPARA RELAY - AIR",
          },
          {
            StationId: 4045,
            StationName: "PB-CHERAPUNJI RELAY - AIR",
          },
          {
            StationId: 4046,
            StationName: "PB-MAHARAJGANJ RELAY - AIR",
          },
          {
            StationId: 4047,
            StationName: "PB-CHAMPAWAT RELAY - AIR",
          },
          {
            StationId: 4048,
            StationName: "PB-DEORIA RELAY - AIR",
          },
          {
            StationId: 4049,
            StationName: "PB-PALI RELAY - AIR",
          },
          {
            StationId: 4050,
            StationName: "PB-AMBAJOGAI RELAY - AIR",
          },
          {
            StationId: 4052,
            StationName: "PB-BALASORE RELAY - AIR",
          },
        ],
      };

      ////=======================****+==============================
      //  save data to shared preferences and local storage
      await saveDirectoryData(
        response.employees,
        response.designations,
        response.stations,
      );

      // SAVE TOKEN
      await saveToken(response.token);

      // SAVE   USER DETAILS
      await saveUserData(response);

      // SAVE USER
      await saveUser(response.empprofile);

      // SAVE LOGIN TIME
      await saveLoginTime();
      // Session valid
      await updateLastActiveTime();

      // UPDATE AUTH STATE
      setUser(response.empprofile);

      setIsLoggedIn(true);
      ////=======================****+==============================
      ////=======================****+==============================

      console.log("Login data saved successfully:");
      toast.success("Login successful. Welcome to Employee Directory.");
    } catch (error) {
      console.log(error);
      console.log("Login data not saved . Please try again.");
      toast.error("Login error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    // <div className="h-screen w-full max-w-[390px] mx-auto bg-white flex flex-col font-sans overflow-hidden">
    <div className="min-h-screen w-full max-w-[390px] mx-auto bg-white flex flex-col font-sans overflow-y-auto">
      {step === "email" && (
        <div className="flex-1 flex flex-col bg-[#1A3A6B]">
          <div className="flex-1 flex flex-col items-center justify-center px-8">
            <div className="w-24 h-24 rounded-full bg-white flex items-center justify-center mb-6 shadow-xl">
              {/* <span className="text-[#F4832A] text-4xl font-bold">PB</span> */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  height: "100vh",
                }}
              >
                <img src="/assets/pb_logo.png" alt="logo" width="200vh" />
              </div>
            </div>
            <h1 className="text-white text-3xl font-bold mb-1">
              Prasar Bharati
            </h1>
            {/* <p className="text-white/60 text-sm mb-12 tracking-wide">Employee Directory</p>
            <h3 className="text-white text-xl font-semibold">Employee Directory</h3> */}
            <p className="text-white/70 text-sm mb-12 tracking-wide">
              Sign in to access <b>Employee Directory</b>
            </p>

            <form onSubmit={handleSendOtp} className="w-full space-y-4">
              <div>
                <label className="block text-white/80 text-xs font-medium mb-2 ml-1">
                  Official Email Id
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="user@prasarbharati.gov.in"
                  className="w-full px-4 py-3.5 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-[#F4832A] transition-all"
                />
                {error && step === "email" && (
                  <p className="text-red-300 text-xs mt-2 ml-1">{error}</p>
                )}
              </div>

              <button
                type="submit"
                className="w-full px-6 py-4 rounded-xl bg-[#F4832A] text-white font-bold text-lg shadow-lg active:scale-[0.98] transition-transform"
              >
                Send OTP
              </button>
            </form>
            <p className="text-white/50 text-sm mt-6 text-center">
              Only registered official email IDs are authorized to log in.
            </p>
          </div>

          <Footer />
        </div>
      )}
      {step === "otp" && (
        <div className="flex-1 flex flex-col">
          <div className="bg-[#1A3A6B] px-6 pt-8 pb-10">
            <button
              onClick={() => setStep("email")}
              className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center mb-8"
            >
              <ArrowLeft className="w-5 h-5 text-white" />
            </button>
            <h2 className="text-white text-2xl font-bold mb-2">
              Check your email
            </h2>
            <p className="text-white/70 text-medium leading-relaxed">
              We've sent a verification code to <br />
              <span className="text-yellow-400 text-lg font-semibold">
                {email}
              </span>
            </p>
          </div>

          <div className="flex-1 bg-yellow-50 px-8 pt-10 rounded-t-[32px] -mt-6">
            <div className="flex gap-2.5 justify-center mb-8">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => void (otpInputRefs.current[index] = el)}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(index, e)}
                  className={`w-11 h-14 text-center text-xl font-bold rounded-xl border-2 focus:outline-none transition-all ${
                    error
                      ? "border-red-500 bg-red-50 text-red-600"
                      : "border-gray-100 bg-gray-50 focus:border-[#F4832A] focus:bg-white"
                  }`}
                />
              ))}
            </div>

            {error && (
              <div className="text-center mb-6">
                <p className="text-red-500 text-sm font-semibold">{error}</p>
              </div>
            )}

            <div className="text-center mb-8">
              {canResend ? (
                <button
                  onClick={handleResendOtp}
                  className="text-[#F4832A] font-bold text-sm hover:underline"
                >
                  Resend OTP
                </button>
              ) : (
                <p className="text-gray-700 text-medium">
                  Resend code in{" "}
                  <span className="font-bold text-[#f86408]">{timer}s</span>
                </p>
              )}
            </div>

            <button
              onClick={handleVerifyOtp}
              disabled={otp.join("").length !== 6}
              className="w-full px-6 py-4 rounded-xl bg-[#1A3A6B] text-white font-bold text-lg shadow-lg active:scale-[0.98] disabled:opacity-30 transition-all"
            >
              Verify & Login
            </button>
          </div>
        </div>
      )}
      {step === "success" && (
        <div className="flex-1 flex flex-col items-center justify-center bg-white px-8">
          <motion.div
            initial={{ scale: 0, rotate: -45 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", damping: 12, stiffness: 200 }}
          >
            <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-8">
              <CheckCircle className="w-14 h-14 text-green-600" />
            </div>
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-2xl font-bold text-gray-900 mb-2"
          >
            User Verified.
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-gray-500 text-center"
          >
            Logging you into the system...
          </motion.p>
        </div>
      )}
      <Loader visible={loading} />
    </div>
  );
}
