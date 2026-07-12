import React from "react";
import { FirebaseCrashlytics } from "@capacitor-firebase/crashlytics";

const FirebaseTestButton: React.FC = () => {
  const handleCrash = async () => {
    await FirebaseCrashlytics.crash({
      message: "Test Crashlytics Crash",
    });
  };

  // return <button onClick={handleCrash}>Test Crashlytics</button>;
  return (
    <button
      onClick={handleCrash}
      style={{
        background: "#fff",
        color: "#000",
        border: "none",
        borderRadius: "14px",
        padding: "14px 28px",
        fontSize: "16px",
        fontWeight: "700",
        cursor: "pointer",
        boxShadow: "0 10px 25px rgba(0,0,0,0.12), 0 2px 6px rgba(0,0,0,0.08)",
      }}
    >
      🚀 Test Crashlytics NEW
    </button>
  );
};

export default FirebaseTestButton;
