// import { useParams, useNavigate } from "react-router";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { getContactByEmail } from "../data/contacts";
import { Employees } from "../models/employees";
import Loader from "../components/Loader";
import {
  ArrowLeft,
  Phone,
  Mail,
  MessageCircle,
  Share2,
  Star,
} from "lucide-react";
import { useFavourites } from "../data/favourites";
import { Share } from "@capacitor/share";
import { getEMPLOYEES_DATA_LIST } from "../utils/storage";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { logGoogleAnalytics } from "../services/analytics-actions";

export function ContactDetailScreen() {
  const { empCode } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const employee = location.state as Employees;
  const [loading, setLoading] = useState(true);

  console.log("employee details", employee);
  console.log("employee details employee.EmpCode", employee.EmpCode);
  if (!employee) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-gray-500">Contact not found</p>
      </div>
    );
  }

  //==========================================
  //==========================================
  //==========================================
  const toggleFavourite = useFavourites((state) => state.toggleFavourite);

  const favouriteIds = useFavourites((state) => state.favouriteIds);

  const favourite =
    employee?.EmpCode !== undefined && favouriteIds.includes(employee.EmpCode);

  console.log("employee favouriteIds", favouriteIds);

  // const handleFavourite = async () => {
  //   if (employee?.EmpCode !== undefined) {
  //     await toggleFavourite(employee);
  //   }
  // };
  // const handleFavourite = async () => {
  //   console.log("Employee:", employee);
  //   console.log("EmpCode:", employee?.EmpCode);
  //   await toggleFavourite(employee);
  // };

  const handleFavourite = async () => {
    try {
      setLoading(true);

      const isAlreadyFavourite = favouriteIds.includes(employee.EmpCode);

      await Promise.all([
        toggleFavourite(employee),
        new Promise((resolve) => setTimeout(resolve, 500)),
      ]);

      toast.success(
        isAlreadyFavourite ? "Removed from favorites." : "Added to favorites.",
      );

      isAlreadyFavourite
        ? logGoogleAnalytics.removeFavourite()
        : logGoogleAnalytics.addFavourite();
    } catch (error) {
      toast.error("Failed to update favorites.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };
  //==========================================
  //==========================================
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 500);

    logGoogleAnalytics.viewContactDetails();
    return () => clearTimeout(timer);
  }, []);
  //==========================================
  //==========================================
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const handleCall = () => {
    logGoogleAnalytics.callEmployee();
    if (!employee.Mobile) return;

    window.location.href = `tel:${employee.Mobile.replace(/\s+/g, "")}`;
  };

  const handleEmail = () => {
    logGoogleAnalytics.emailEmployee();
    window.location.href = `mailto:${employee.Email}`;
  };

  const handleWhatsApp = () => {
    logGoogleAnalytics.whatsAppEmployee();
    if (!employee.Mobile) return;

    const phone = employee.Mobile.replace(/[^0-9]/g, "");

    window.open(`https://wa.me/${phone}`, "_blank");
  };

  const handleShareApp = async () => {
    logGoogleAnalytics.shareEmployeeDetails();
    try {
      await Share.share({
        title: employee.Name,
        text: `Prasar Bharati PB Employee Directory\nShare Contact Details:\nName: ${
          employee.Name
        }\nDesignation: ${employee.DesignationName}\nMobile: ${
          employee.Mobile || "Mobile Number not available"
        }\nEmail: ${employee.Email}\nStation: ${
          employee.StationName
        }\nPB Employee Directory App:\nhttps://play.google.com/store/apps/developer?id=Prasar+Bharati+%28All+India+Radio,+Doordarshan%29`,
        dialogTitle: "Share Contact Details",
      });
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="h-full flex flex-col bg-white overflow-y-auto">
      {/* Header */}
      <div className="bg-[#1A3A6B] px-6 pt-6 pb-12 relative">
        <button
          onClick={() => navigate(-1)}
          className="absolute top-6 left-6 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center"
        >
          <ArrowLeft className="w-5 h-5 text-white" />
        </button>

        <button
          onClick={handleFavourite}
          className="absolute top-6 right-6 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center"
        >
          <Star
            className={`w-5 h-5 transition-all ${
              favourite ? "text-[#F4832A] fill-[#F4832A]" : "text-white"
            }`}
          />
        </button>

        <div className="flex flex-col items-center">
          <div className="w-32 h-32 rounded-full bg-[#F4832A] flex items-center justify-center mb-4">
            <span className="text-white text-5xl font-bold">
              {getInitials(employee.Name)}
            </span>
          </div>

          <h2 className="text-white text-mediumfont-bold mb-1 text-center">
            {employee.Name}
          </h2>

          <p className="text-yellow-300 mb-2 text-center">
            {employee.DesignationName}
          </p>

          <span className="px-3 py-1 rounded-full bg-[#F4832A] text-white text-sm font-medium">
            {employee.StationName}
          </span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="px-6 py-6 flex justify-center gap-4">
        <button
          onClick={handleCall}
          className="flex flex-col items-center gap-2"
        >
          <div className="w-14 h-14 rounded-full bg-[#1A3A6B] flex items-center justify-center">
            <Phone className="w-6 h-6 text-white" />
          </div>

          <span className="text-xs text-gray-600">Call</span>
        </button>

        <button
          onClick={handleEmail}
          className="flex flex-col items-center gap-2"
        >
          <div className="w-14 h-14 rounded-full bg-gray-200 flex items-center justify-center">
            <Mail className="w-6 h-6 text-gray-700" />
          </div>

          <span className="text-xs text-gray-600">Email</span>
        </button>

        <button
          onClick={handleWhatsApp}
          className="flex flex-col items-center gap-2"
        >
          <div className="w-14 h-14 rounded-full bg-gray-200 flex items-center justify-center">
            <MessageCircle className="w-6 h-6 text-gray-700" />
          </div>

          <span className="text-xs text-gray-600">WhatsApp</span>
        </button>

        <button
          onClick={handleShareApp}
          className="flex flex-col items-center gap-2"
        >
          <div className="w-14 h-14 rounded-full bg-gray-200 flex items-center justify-center">
            <Share2 className="w-6 h-6 text-gray-700" />
          </div>

          <span className="text-xs text-gray-600">Share</span>
        </button>
      </div>

      {/* Contact Information */}
      <div className="px-6 py-4 space-y-6 border-t border-gray-100">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
            <Phone className="w-5 h-5 text-gray-600" />
          </div>

          <div className="flex-1">
            <p className="text-xs text-gray-500 mb-1">Mobile Number</p>

            <p className="text-gray-900 font-medium break-all">
              {employee.Mobile || "Mobile not available"}
            </p>
          </div>
        </div>

        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
            <Mail className="w-5 h-5 text-gray-600" />
          </div>

          <div className="flex-1">
            <p className="text-xs text-gray-500 mb-1">Email</p>

            <p className="text-gray-900 font-medium break-all">
              {employee.Email}
            </p>
          </div>
        </div>

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
            <p className="text-xs text-gray-500 mb-1">Station</p>

            <p className="text-gray-900 font-medium">{employee.StationName}</p>
          </div>
        </div>
      </div>
      <Loader visible={loading} />
    </div>
  );
}
