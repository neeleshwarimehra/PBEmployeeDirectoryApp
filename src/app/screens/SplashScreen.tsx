import { useEffect } from "react";
import { useNavigate } from "react-router";
import { motion, vw } from "motion/react";
import { ChevronRight } from "lucide-react";
import { useAuth } from "../context/AuthProvider";
import { logGoogleAnalytics } from "../services/analytics-actions";
import Loader from "../components/Loader";
import { useState } from "react";

function gearPath(
  cx: number,
  cy: number,
  outerR: number,
  innerR: number,
  teeth: number,
): string {
  const total = teeth * 2;
  const pts: string[] = [];
  for (let i = 0; i < total; i++) {
    const angle = (i / total) * Math.PI * 2 - Math.PI / 2;
    const r = i % 2 === 0 ? outerR : innerR;
    pts.push(
      `${(cx + r * Math.cos(angle)).toFixed(2)},${(
        cy +
        r * Math.sin(angle)
      ).toFixed(2)}`,
    );
  }
  return `M ${pts.join(" L ")} Z`;
}

function SplashIllustration() {
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1100);
    logGoogleAnalytics.viewFavourites();
    return () => clearTimeout(timer);
  }, []);

  return (
    <svg
      viewBox="0 0 390 380"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-full"
      preserveAspectRatio="xMidYMax meet"
    >
      {/* Large gear — top left, partially bleeding off screen */}
      <g>
        <path
          d={gearPath(34, 62, 30, 21, 8)}
          fill="#F4832A"
          fillOpacity="0.22"
        />
        <circle cx="34" cy="62" r="13" fill="#F4832A" fillOpacity="0.38" />
        <circle cx="34" cy="62" r="5.5" fill="#F4832A" fillOpacity="0.6" />
      </g>

      {/* Small gear — upper right */}
      <g>
        <path
          d={gearPath(352, 86, 19, 13, 6)}
          fill="white"
          fillOpacity="0.14"
        />
        <circle cx="352" cy="86" r="7" fill="white" fillOpacity="0.18" />
        <circle cx="352" cy="86" r="3" fill="white" fillOpacity="0.28" />
      </g>

      {/* Tiny accent dots near top */}
      <circle cx="288" cy="28" r="5" fill="white" fillOpacity="0.13" />
      <circle cx="308" cy="20" r="3" fill="#F4832A" fillOpacity="0.45" />

      {/* MAIN saffron circle — oversized, bleeding off top edge */}
      <circle cx="195" cy="128" r="222" fill="#F4832A" />

      {/* Subtle inner specular highlight */}
      <ellipse
        cx="155"
        cy="58"
        rx="128"
        ry="68"
        fill="white"
        fillOpacity="0.055"
      />

      {/* PB monogram — large, bold, navy */}
      {/* <text
        x="195"
        y="172"
        fontFamily="'Noto Sans', -apple-system, BlinkMacSystemFont, sans-serif"
        fontSize="178"
        fontWeight="900"
        fill="#1A3A6B"
        textAnchor="middle"
        dominantBaseline="middle"
        letterSpacing="-8"
      >
        PB
      </text> */}

      {/* Floating ring — mid right */}
      <circle
        cx="375"
        cy="228"
        r="21"
        stroke="#F4832A"
        strokeWidth="2.2"
        opacity="0.28"
      />
      <circle cx="375" cy="228" r="8" fill="#F4832A" fillOpacity="0.28" />

      {/* Dot cluster — lower left */}
      <circle cx="22" cy="308" r="7" fill="#F4832A" fillOpacity="0.28" />
      <circle cx="39" cy="327" r="4" fill="#F4832A" fillOpacity="0.18" />
      <circle cx="14" cy="332" r="3" fill="#F4832A" fillOpacity="0.12" />

      {/* Bottom-right whisper ring */}
      <circle
        cx="362"
        cy="364"
        r="16"
        stroke="white"
        strokeWidth="1.5"
        opacity="0.08"
      />
    </svg>
  );
}

export function SplashScreen() {
  const navigate = useNavigate();

  const { isLoggedIn, loading } = useAuth();

  useEffect(() => {
    if (loading) return;

    logGoogleAnalytics.splashView();
    const timer = setTimeout(() => {
      navigate(isLoggedIn ? "/app" : "/login", { replace: true });
    }, 1000);

    return () => clearTimeout(timer);
  }, [isLoggedIn, loading, navigate]);

  return (
    <div
      className="h-screen w-full max-w-[390px] mx-auto overflow-hidden relative flex flex-col"
      style={{ background: "#1A3A6B" }}
    >
      {/* Subtle dot-grid texture */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <img src="/assets/pb_logo.png" alt="logo" width="200vh" />
      </div>
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "radial-gradient(circle, rgba(255,255,255,0.032) 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
      />

      {/* Illustration — top 62% of screen */}
      <motion.div
        className="relative overflow-hidden"
        style={{ height: "62%" }}
        initial={{ opacity: 0, y: 28 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.95, ease: [0.16, 1, 0.3, 1] }}
      >
        {/* <SplashIllustration /> */}
      </motion.div>

      {/* Bottom content — bottom 38% */}

      <motion.div
        className="relative flex-1 px-8 pb-12 pt-4 flex flex-col justify-between"
        initial={{ opacity: 0, y: 32 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.75, delay: 0.32, ease: [0.16, 1, 0.3, 1] }}
      >
        {/* Text block */}
        <div>
          <h1
            className="text-white leading-none tracking-tight mb-3"
            style={{ fontSize: "38px", fontWeight: 900, lineHeight: 1.05 }}
          >
            Prasar
            <br />
            Bharati
          </h1>

          <p
            style={{
              color: "#F4832A",
              fontSize: "15px",
              fontWeight: 600,
              letterSpacing: "0.025em",
            }}
          >
            PB Employee Directory
          </p>

          <p
            className="mt-3"
            style={{
              color: "rgba(255,255,255,0.36)",
              fontSize: "13px",
              lineHeight: 1.6,
              letterSpacing: "0.01em",
            }}
          >
            Prasar Bharati:
            <br />
            India's Public Service Broadcaster.
          </p>
        </div>

        {/* Navigation row — Skip | dots | arrow */}
        <div className="flex items-center justify-between">
          <br />
          {/* Arrow button */}
          {/* <motion.button
            onClick={() => navigate("/login")}
            className="flex items-center justify-center rounded-full"
            style={{
              width: 54,
              height: 54,
              background: "#F4832A",
              boxShadow: "0 8px 24px rgba(244,131,42,0.38)",
            }}
            whileTap={{ scale: 0.92 }}
            transition={{ type: "spring", stiffness: 400, damping: 20 }}
          >
            <ChevronRight size={24} color="#1A3A6B" strokeWidth={2.8} />
          </motion.button> */}
        </div>
      </motion.div>
      <Loader visible={loading} />
    </div>
  );
}
