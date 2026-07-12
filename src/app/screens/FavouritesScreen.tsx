import { useNavigate } from "react-router-dom";
import { Star } from "lucide-react";

import { useFavourites } from "../data/favourites";
import { Employees } from "../models/employees";
import Loader from "../components/Loader";
import { useEffect, useState } from "react";
import { logGoogleAnalytics } from "../services/analytics-actions";

const avatarColors = [
  "bg-[#A8E6CF]",
  "bg-[#FFD3B6]",
  "bg-[#FFAAA5]",
  "bg-[#B4D5F0]",
  "bg-[#D4A5A5]",
  "bg-[#FFDAB9]",
];

export function FavouritesScreen() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const favouriteContacts = useFavourites((state) => state.favouriteContacts);

  const toggleFavourite = useFavourites((state) => state.toggleFavourite);

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getAvatarColor = (index: number) => {
    return avatarColors[index % avatarColors.length];
  };

  const handleContactClick = (contact: Employees) => {
    navigate(`/app/contact/${contact.EmpCode}`, {
      state: contact,
    });
  };
  //handleRemoveFavourite
  const handleRemoveFavourite = async (
    e: React.MouseEvent,
    contact: Employees,
  ) => {
    e.stopPropagation();

    await toggleFavourite(contact);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);
    logGoogleAnalytics.viewFavourites();
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="bg-[#1A3A6B] px-6 pt-4 pb-6">
        <h1 className="text-yellow-300 text-2xl font-bold">
          Favourite Contacts
        </h1>

        <p className="text-yellow-200 text-sm mt-1">
          Save your frequently used contacts for quick access.
        </p>

        <p className="text-white text-sm mt-1">
          {favouriteContacts.length} bookmarked contact
          {favouriteContacts.length !== 1 ? "s" : ""}
        </p>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto bg-gray-50 px-4 pt-4">
        {favouriteContacts.length > 0 ? (
          <div className="grid grid-cols-2 gap-3 pb-6">
            {favouriteContacts.map((contact, index) => (
              <div
                key={contact.EmpCode}
                onClick={() => handleContactClick(contact)}
                className="relative bg-white rounded-2xl p-4 flex flex-col items-center cursor-pointer active:scale-95 transition-transform shadow-sm"
              >
                {/* Remove Favourite */}
                <button
                  type="button"
                  onClick={(e) => handleRemoveFavourite(e, contact)}
                  className="absolute top-3 right-3"
                >
                  <Star className="w-5 h-5 text-[#F4832A] fill-[#F4832A]" />
                </button>

                {/* Avatar */}
                <div
                  className={`w-16 h-16 rounded-full ${getAvatarColor(
                    index,
                  )} flex items-center justify-center mb-3 mt-2`}
                >
                  <span className="text-gray-800 font-bold text-lg">
                    {getInitials(contact.Name)}
                  </span>
                </div>

                {/* Name */}
                <h3 className="font-semibold text-gray-900 text-center text-sm">
                  {contact.Name}
                </h3>

                {/* Designation */}
                <p className="text-xs text-gray-600 text-center mt-1">
                  {contact.DesignationName}
                </p>

                {/* Station */}
                <p className="text-xs text-gray-900 text-center mt-1">
                  {contact.StationName}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full px-8 text-center">
            <div className="w-32 h-32 mb-4 rounded-full bg-gray-100 flex items-center justify-center">
              <Star className="w-16 h-16 text-gray-400" />
            </div>

            <h3 className="font-semibold text-gray-900 mb-1">
              No bookmarked contacts
            </h3>

            <p className="text-sm text-gray-500">
              Bookmark your frequently contacted employees here.
            </p>
          </div>
        )}
      </div>
      <Loader visible={loading} />
    </div>
  );
}
