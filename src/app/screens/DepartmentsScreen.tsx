import { useState } from "react";
import { mockContacts } from "../data/contacts";
import { Building2 } from "lucide-react";
import { useNavigate } from "react-router";
import { Employees } from "../models/employees";

const departments = ["DD News", "AIR", "HQ", "Engineering", "Admin"];

const avatarColors = [
  "bg-[#A8E6CF]",
  "bg-[#FFD3B6]",
  "bg-[#FFAAA5]",
  "bg-[#B4D5F0]",
  "bg-[#D4A5A5]",
  "bg-[#FFDAB9]",
];

export function DepartmentsScreen() {
  const [selectedDept, setSelectedDept] = useState(departments[0]);
  const navigate = useNavigate();

  const deptContacts = mockContacts.filter(
    (contact) => contact.StationName === selectedDept,
  );

  const getDeptStats = (dept: string) => {
    return mockContacts.filter((c) => c.StationName === dept).length;
  };

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

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="bg-[#1A3A6B] px-6 pt-4 pb-6">
        <h1 className="text-white text-xl font-semibold">Departments</h1>
        <p className="text-white/70 text-sm mt-1">Browse by department</p>
      </div>

      {/* Department Pills */}
      <div className="px-6 py-4 flex gap-2 overflow-x-auto scrollbar-hide border-b border-gray-100">
        {departments.map((dept) => (
          <button
            key={dept}
            onClick={() => setSelectedDept(dept)}
            className={`px-4 py-2 rounded-full whitespace-nowrap text-sm font-medium transition-all ${
              selectedDept === dept
                ? "bg-[#1A3A6B] text-white"
                : "bg-gray-100 text-gray-700"
            }`}
          >
            {dept} ({getDeptStats(dept)})
          </button>
        ))}
      </div>

      {/* Contact List */}
      <div className="flex-1 overflow-y-auto">
        {deptContacts.length > 0 ? (
          <div>
            {deptContacts.map((contact, index) => (
              <div
                key={contact.EmpCode}
                onClick={() => navigate(`/app/contact/${contact.EmpCode}`)}
                className="px-6 py-3 flex items-center gap-3 active:bg-gray-50 cursor-pointer border-b border-gray-50"
              >
                <div
                  className={`w-12 h-12 rounded-full ${getAvatarColor(
                    index,
                  )} flex items-center justify-center flex-shrink-0`}
                >
                  <span className="text-gray-800 font-semibold text-sm">
                    {getInitials(contact.Name)}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900">
                    {contact.Name}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {contact.DesignationName}
                  </p>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    window.location.href = `tel:${contact.Mobile}`;
                  }}
                  className="w-10 h-10 rounded-full bg-[#1A3A6B] flex items-center justify-center flex-shrink-0"
                >
                  <svg
                    className="w-5 h-5 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                    />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full px-8 text-center">
            <div className="w-32 h-32 mb-4 rounded-full bg-gray-100 flex items-center justify-center">
              <Building2 className="w-16 h-16 text-gray-400" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">
              No contacts in this department
            </h3>
          </div>
        )}
      </div>
    </div>
  );
}
