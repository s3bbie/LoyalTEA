// components/SplashScreen.js
import { useEffect, useState } from "react";

export default function SplashScreen({ onFinish }) {
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setFadeOut(true);
      setTimeout(() => onFinish(), 500); // allow fade animation
    }, 2000); // show logo for 2s
    return () => clearTimeout(timer);
  }, [onFinish]);

  return (
    <div className={`splash-screen ${fadeOut ? "fade-out" : ""}`}>
      <img src="/images/logo.png" alt="LoyalTEA Logo" className="splash-logo" />
    </div>
  );
}
