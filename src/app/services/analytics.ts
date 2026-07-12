import { Capacitor } from "@capacitor/core";
import { FirebaseAnalytics } from "@capacitor-firebase/analytics";
import { logGoogleAnalytics } from "./analytics-actions";

let webAnalytics: any = null;

/**
 * Initialize analytics
 */
export async function initializeAnalytics() {
  try {
    const platform = Capacitor.getPlatform();

    // Native (Android)
    if (platform === "android") {
      logGoogleAnalytics.sessionStartAndroid();
      console.log("THIS IS ANDROID APP");
      await FirebaseAnalytics.setEnabled({
        enabled: true,
      });
    }
    // Native (iOS)
    else if (platform === "ios") {
      console.log("THIS IS IOS APP");
      logGoogleAnalytics.sessionStartIOS();

      await FirebaseAnalytics.setEnabled({
        enabled: true,
      });
    }
    // Web
    else {
      logGoogleAnalytics.sessionStartWEB();
      console.log("THIS IS WEB APP");
    }
    // Web
    const { initializeApp } = await import("firebase/app");
    const { getAnalytics, isSupported, logEvent } = await import(
      "firebase/analytics"
    );

    const supported = await isSupported();

    if (!supported) {
      console.warn("Firebase Analytics not supported in this browser");
      return;
    }

    // For Firebase JS SDK v7.20.0 and later, measurementId is optional
    const firebaseConfig = {
      apiKey: "AIzaSyAQtD5DfKEtu4kn80wAhOf_swKEy6ZWvNw",
      authDomain: "pb-telephone-directory.firebaseapp.com",
      projectId: "pb-telephone-directory",
      storageBucket: "pb-telephone-directory.firebasestorage.app",
      messagingSenderId: "554046369315",
      appId: "1:554046369315:web:c10be8b4815210cb368b96",
      measurementId: "G-0SJKMQVPRZ",
    };

    const app = initializeApp(firebaseConfig);

    webAnalytics = getAnalytics(app);

    logEvent(webAnalytics, "app_open");

    console.log("Firebase Analytics initialized (web)");
  } catch (error) {
    console.error("Analytics initialization failed:", error);
  }
}

/**
 * Track event
 */
export async function trackEvent(name: string, params?: Record<string, any>) {
  try {
    const platform = Capacitor.getPlatform();

    if (platform === "android" || platform === "ios") {
      await FirebaseAnalytics.logEvent({
        name,
        params,
      });
      return;
    }

    if (webAnalytics) {
      const { logEvent } = await import("firebase/analytics");

      logEvent(webAnalytics, name, params);
    }
  } catch (error) {
    console.error(`Analytics event failed (${name}):`, error);
  }
}

/**
 * Set user id
 */
export async function setAnalyticsUser(userId: string) {
  try {
    const platform = Capacitor.getPlatform();

    if (platform === "android" || platform === "ios") {
      await FirebaseAnalytics.setUserId({
        userId,
      });
    }
  } catch (error) {
    console.error("Set user id failed:", error);
  }
}
