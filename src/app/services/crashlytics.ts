import { FirebaseCrashlytics } from "@capacitor-firebase/crashlytics";
import { Capacitor } from "@capacitor/core";

export const initCrashlytics = async () => {
  const platform = Capacitor.getPlatform();

  console.log("Platform APP RUNNING FOR :", platform);

  if (platform === "web") {
    console.log("Crashlytics is not supported on Web");
    return;
  }

  try {
    await FirebaseCrashlytics.setEnabled({
      enabled: true,
    });

    console.log("Crashlytics initialized successfully");
  } catch (error) {
    console.error("Crashlytics initialization failed:", error);
  }
};

export const logError = async (error: any) => {
  const platform = Capacitor.getPlatform();

  if (platform === "web") {
    console.error("Application Error:", error);
    return;
  }

  try {
    await FirebaseCrashlytics.recordException({
      message: error?.message || "Unknown Error",
    });
  } catch (crashlyticsError) {
    console.error("Failed to record exception:", crashlyticsError);
  }
};
