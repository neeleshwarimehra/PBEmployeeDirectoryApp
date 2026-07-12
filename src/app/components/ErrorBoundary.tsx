import React, { Component, ErrorInfo, ReactNode } from "react";
import { FirebaseCrashlytics } from "@capacitor-firebase/crashlytics";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  static getDerivedStateFromError(_: Error): State {
    return {
      hasError: true,
    };
  }

  async componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Error Boundary:", error, errorInfo);

    try {
      await FirebaseCrashlytics.recordException({
        message: error.message,
      });
    } catch (e) {
      console.error("Crashlytics error:", e);
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: "20px" }}>
          <h2>Something went wrong.</h2>
          <p>Please restart the app.</p>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
