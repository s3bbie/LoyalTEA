// pages/home.js
import { useEffect, useState } from "react";
import Head from "next/head";
import BottomNav from "../components/BottomNav";
import jwt from "jsonwebtoken";
import * as cookie from "cookie";
import { supabase } from "../utils/supabaseClient";
import { QRCodeCanvas } from "qrcode.react";

function IntroModal({ onClose }) {
  return (
    <div className="modal">
      <div className="modal-content">
        <span className="close" onClick={onClose}>×</span>
        <h2>Welcome to LoyalTEA ☕</h2>
        <p>
          Collect stamps every time you buy at the canteen. 
          Once you reach 9, redeem a free drink 🎉
        </p>
        <button className="btn-primary" onClick={onClose}>
          Got it!
        </button>
      </div>
    </div>
  );
}

function Home({ user }) {
  const [stampCount, setStampCount] = useState(0);
  const [showQR, setShowQR] = useState(false);
  const [showIntro, setShowIntro] = useState(false);

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

          {/* ✅ Collect Stamps Button with expandable QR */}
          <div className={`qr-box ${showQR ? "open" : ""}`}>
            <button className="use-btn" onClick={() => setShowQR(!showQR)}>
              <div className="button-text-container">
                <span className="collect-stamps-text">Select here to</span>
                <span className="scan-at-till-text">Show QR Code</span>
              </div>
            </button>

            <div className="qr-content">
              <button
                className="qr-close-inline"
                onClick={() => setShowQR(false)}
              >
              </button>
              <div className="qr-display">
                <QRCodeCanvas
  value={JSON.stringify({ mode: "stamp", userId: user.id })}
  size={160}
/>

                <p>Show this QR Code to staff to < br/>collect your stamp</p>
              </div>
            </div>
          </div>

          <div className="action-section">
            <button className="menu-btn" id="menuBtn">Canteen Menu</button>
          </div>
        </div>

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
