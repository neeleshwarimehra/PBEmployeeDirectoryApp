import { Search, Mic } from "lucide-react";
import { useState } from "react";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  onVoiceSearch?: () => void;
}

export function SearchBar({
  value,
  onChange,
  placeholder = "Search contacts...",
  onVoiceSearch,
}: SearchBarProps) {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <div
      className={`flex items-center gap-3 px-4 py-3 bg-gray-100 rounded-2xl transition-all ${
        isFocused ? "ring-2 ring-[#1A3A6B]" : ""
      }`}
    >
      <Search className="w-5 h-5 text-gray-500 flex-shrink-0" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        placeholder={placeholder}
        className="flex-1 bg-transparent outline-none text-gray-900 placeholder:text-gray-500"
      />
      <button
        onClick={onVoiceSearch}
        className="w-8 h-8 rounded-full bg-[#F4832A] flex items-center justify-center flex-shrink-0"
      >
        <Mic className="w-4 h-4 text-white" />
      </button>
    </div>
  );
}
