import { Outlet, useLocation, useNavigate } from "react-router";
import { Home, Star, User } from "lucide-react";

export function Layout() {
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    { label: "Home", icon: Home, path: "/app" },
    { label: "Favourite", icon: Star, path: "/app/favourites" },
    { label: "Profile", icon: User, path: "/app/profile" },
  ];

  const isActive = (path: string) => {
    if (path === "/app") {
      return location.pathname === "/app";
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="h-screen w-full max-w-[390px] mx-auto bg-white flex flex-col">
      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        <Outlet />
      </div>

      {/* Bottom Navigation */}
      <nav className="border-t border-gray-100 bg-white">
        <div className="flex items-center justify-around px-4 py-3">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className="flex flex-col items-center justify-center gap-1 min-w-[60px]"
              >
                <div
                  className={`p-2 rounded-xl transition-colors ${
                    active ? "bg-[#1A3A6B] text-white" : "text-gray-400"
                  }`}
                >
                  <Icon className="w-5 h-5" strokeWidth={active ? 2.5 : 2} />
                </div>
                <span
                  className={`text-[10px] ${
                    active ? "text-[#1A3A6B] font-medium" : "text-gray-400"
                  }`}
                >
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
