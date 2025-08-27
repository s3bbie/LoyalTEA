// pages/home.js
import { useEffect, useState } from "react";
import Head from "next/head";
import BottomNav from "../components/BottomNav";
import QrScanner from "qr-scanner";
import jwt from "jsonwebtoken";
import * as cookie from "cookie";
import { useRouter } from "next/router";
import { supabase } from "../utils/supabaseClient";

let scannerInstance = null;
let scanHandled = false;

function IntroModal({ onClose }) {
  return (
    <div className="intro-overlay">
      <div className="intro-content">
        <h2>Welcome to LoyalTEA ☕</h2>
        <p>
          Collect stamps every time you buy at the canteen. Once you reach 9, redeem a free drink 🎉
        </p>
        <button className="btn-primary" onClick={onClose}>Got it!</button>
      </div>
    </div>
  );
}

function Home({ user }) {
  const router = useRouter();
  const [stampCount, setStampCount] = useState(0);
  const [showQRModal, setShowQRModal] = useState(false);
  const [showIntro, setShowIntro] = useState(false);
  const [scanStatus, setScanStatus] = useState("");

  useEffect(() => {
    if (!localStorage.getItem("introSeen")) {
      setShowIntro(true);
    }

    const fetchStampCount = async () => {
      const { data, error } = await supabase
        .from("users")
        .select("stamp_count")
        .eq("id", user.sub)
        .single();

      if (!error && data) {
        setStampCount(data.stamp_count || 0);
      } else {
        console.error("⚠️ Error loading stamp count:", error?.message);
      }
    };

    fetchStampCount();
  }, [user.sub]);

  const handleCloseIntro = () => {
    localStorage.setItem("introSeen", "true");
    setShowIntro(false);
  };

  const generateTodayHash = async () => {
    const today = new Date().toISOString().slice(0, 10);
    const encoder = new TextEncoder();
    const hashBuffer = await crypto.subtle.digest(
      "SHA-256",
      encoder.encode("LOYALTEA_SECRET_SALT" + today)
    );
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
  };

  const handleShowQRCode = async () => {
    setShowQRModal(true);
    scanHandled = false;

    const todayHash = await generateTodayHash();
    const videoElem = document.getElementById("qr-reader");

    scannerInstance = new QrScanner(
      videoElem,
      async (result) => {
        if (scanHandled) return;

        let data;
        try {
          data = JSON.parse(result.data);
        } catch {
          setScanStatus("Invalid QR code.");
          return;
        }

        if (data.type === "staff" && data.code === todayHash) {
          scanHandled = true;
          await addStamp();
          setScanStatus("✅ Stamp added!");
          scannerInstance.stop();
          setTimeout(() => setShowQRModal(false), 1200);
        } else {
          setScanStatus("Invalid staff QR.");
        }
      },
      {
        preferredCamera: "environment",
        highlightScanRegion: true,
        highlightCodeOutline: true,
      }
    );

    scannerInstance.start();
  };

  const addStamp = async () => {
    if (stampCount >= 9) {
      alert("You already have 9 stamps. Please redeem your free drink before collecting more.");
      return;
    }

    const newCount = stampCount + 1;

    const { error: updateErr } = await supabase
      .from("users")
      .update({ stamp_count: newCount })
      .eq("id", user.sub);

    if (updateErr) {
      console.error("⚠️ Error updating stamp count:", updateErr.message);
      return;
    }

    setStampCount(newCount);
  };

  return (
    <>
      <Head><title>Home – LoyalTEA</title></Head>

      <div id="pageWrapper">
        <div className="home-container">
          <div className="top-background-block"></div>

          <div className="home-header">
            <p className="welcome-text">
              Hi,<span className="user-name"> {user.username}</span>
            </p>
          </div>

          <h2 className="beans-title-outside">Total Stamps</h2>

          <div className="action-section">
            <section className="beans-card">
              <div className="beans-visual">
                <div className="beans-count">
                  <span>{stampCount}</span>/<span>9</span>
                </div>
                <div className="stamp-grid" id="stampGrid">
                  {[...Array(9)].map((_, i) => (
                    <div key={i} className={`stamp ${i < stampCount ? "filled" : ""}`} />
                  ))}
                </div>
              </div>
            </section>
          </div>

          <div className="action-section">
            <button className="use-btn" onClick={handleShowQRCode}>
              <div className="button-text-container">
                <span className="collect-stamps-text">Collect Stamps</span>
                <span className="scan-at-till-text">Scan at till</span>
              </div>
            </button>
          </div>

          <div className="action-section">
            <button className="menu-btn" id="menuBtn">Canteen Menu</button>
          </div>
        </div>

{showQRModal && (
  <div className="qr-fullscreen">
    <button
      className="qr-close-x"
      onClick={() => {
        if (scannerInstance) scannerInstance.stop();
        setShowQRModal(false);
      }}
    >
      ✖
    </button>
    <video id="qr-reader" playsInline autoPlay muted></video>
    <div className="qr-overlay">
      <p>{scanStatus}</p>
      <button
        className="close-btn"
        onClick={() => {
          if (scannerInstance) scannerInstance.stop();
          setShowQRModal(false);
        }}
      >
        Cancel
      </button>
    </div>
  </div>
)}


        {showIntro && <IntroModal onClose={handleCloseIntro} />}
        <BottomNav stampCount={stampCount} />
      </div>
    </>
  );
}

export async function getServerSideProps({ req }) {
  const cookies = cookie.parse(req.headers.cookie || "");
  const token = cookies.token || null;

  if (!token) {
    return { redirect: { destination: "/", permanent: false } };
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return { props: { user: decoded } };
  } catch (err) {
    return { redirect: { destination: "/", permanent: false } };
  }
}

export default Home;
