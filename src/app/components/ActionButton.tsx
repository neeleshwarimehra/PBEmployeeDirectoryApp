import { LucideIcon } from "lucide-react";

interface ActionButtonProps {
  icon: LucideIcon;
  label: string;
  onClick: () => void;
  variant?: "filled" | "outlined";
  disabled?: boolean;
}

export function ActionButton({
  icon: Icon,
  label,
  onClick,
  variant = "outlined",
  disabled = false,
}: ActionButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`flex items-center justify-center gap-2 px-6 py-3 rounded-full font-medium transition-all ${
        disabled
          ? "bg-gray-100 text-gray-400 cursor-not-allowed"
          : variant === "filled"
          ? "bg-[#1A3A6B] text-white active:bg-[#0f2545]"
          : "border-2 border-[#1A3A6B] text-[#1A3A6B] active:bg-[#1A3A6B] active:text-white"
      }`}
    >
      <Icon className="w-5 h-5" />
      <span>{label}</span>
    </button>
  );
}
