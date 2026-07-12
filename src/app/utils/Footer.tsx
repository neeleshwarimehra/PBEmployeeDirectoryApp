import { App } from "@capacitor/app";
import { useEffect, useState } from "react";
import { Capacitor } from "@capacitor/core";

const Footer = () => {
  const [version, setVersion] = useState("");

  useEffect(() => {
    getVersion();
  }, []);

  const getVersion = async () => {
    try {
      if (Capacitor.getPlatform() !== "web") {
        const info = await App.getInfo();
        return info;
      }

      return { version: "web" };
    } catch (e) {
      console.log("Capacitor not available");
    }
  };

  return (
    <div className="pb-8 text-center space-y-1">
      <p className="text-gray-400 text-[11px]">
        App Version {version || "1.0.0"}
      </p>
      <p className="text-gray-400 text-[11px]">
        Designed and developed by <b>IT Division Prasar Bharati</b>
      </p>
      {/* <p className="text-white/30 text-[11px]">© 2026 Prasar Bharati</p> */}
      <p className="text-gray-400 text-[11px]">
        © {new Date().getFullYear()} Prasar Bharati
      </p>
    </div>
  );
};

export default Footer;
