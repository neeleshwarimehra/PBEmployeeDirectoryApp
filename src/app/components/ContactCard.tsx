import { Phone, Star } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Employees } from "../models/employees";
import { useFavourites } from "../data/favourites";

interface ContactCardProps {
  contact: Employees;
}

export function ContactCard({ contact }: ContactCardProps) {
  const navigate = useNavigate();

  const toggleFavourite = useFavourites((state) => state.toggleFavourite);

  const favouriteIds = useFavourites((state) => state.favouriteIds);

  const isFavourite =
    contact.EmpCode !== undefined && favouriteIds.includes(contact.EmpCode);

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getDepartmentColor = (station: string) => {
    const colors: Record<string, string> = {
      Delhi: "bg-blue-100 text-blue-700",
      Lucknow: "bg-green-100 text-green-700",
      Noida: "bg-purple-100 text-purple-700",
      Agra: "bg-orange-100 text-orange-700",
    };

    return colors[station] || "bg-gray-100 text-gray-700";
  };

  const handleCardClick = () => {
    if (contact.EmpCode !== undefined) {
      navigate(`/app/contact/${contact.EmpCode}`, {
        state: contact,
      });
    }
  };

  const handleCall = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();

    if (contact.Mobile) {
      window.location.href = `tel:${contact.Mobile}`;
    }
  };

  const handleFavourite = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();

    if (contact.EmpCode !== undefined) {
      await toggleFavourite(contact.EmpCode);
    }
  };

  return (
    <div
      onClick={handleCardClick}
      className="flex items-center gap-3 p-3 border-b border-gray-100 active:bg-gray-50 cursor-pointer transition-colors"
    >
      {/* Avatar */}
      <div className="w-12 h-12 rounded-full bg-[#1A3A6B] flex items-center justify-center flex-shrink-0">
        <span className="text-white font-medium text-sm">
          {getInitials(contact.Name)}
        </span>
      </div>

      {/* Employee Info */}
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-gray-900 truncate">{contact.Name}</h3>

        <p className="text-sm text-gray-600 truncate">
          {contact.DesignationName}
        </p>

        <span
          className={`inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-medium ${getDepartmentColor(
            contact.StationName,
          )}`}
        >
          {contact.StationName}
        </span>
      </div>

      {/* Favourite Button */}
      <button
        type="button"
        onClick={handleFavourite}
        className="w-10 h-10 flex items-center justify-center flex-shrink-0"
      >
        <Star
          className={`w-5 h-5 ${
            isFavourite ? "fill-red-500 text-red-500" : "text-gray-400"
          }`}
        />
      </button>

      {/* Call Button */}
      <button
        type="button"
        onClick={handleCall}
        className="w-10 h-10 rounded-full bg-[#F4832A] flex items-center justify-center flex-shrink-0 hover:opacity-90"
      >
        <Phone className="w-5 h-5 text-white" />
      </button>
    </div>
  );
}
