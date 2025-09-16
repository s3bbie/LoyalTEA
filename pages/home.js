// pages/home.js
import { useEffect, useState } from "react";
import Head from "next/head";
import BottomNav from "../components/BottomNav";
import jwt from "jsonwebtoken";
import * as cookie from "cookie";
import { supabase } from "../utils/supabaseClient";
import { QRCodeCanvas } from "qrcode.react";
import DonationCard from "../components/DonationCard";

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
  const [stamps, setStamps] = useState([]);
  const [showQR, setShowQR] = useState(false);
  const [showIntro, setShowIntro] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem("introSeen")) {
      setShowIntro(true);
    }

    // ✅ Fetch stamps (with reusable flag)
    const fetchStamps = async () => {
      const { data, error } = await supabase
        .from("stamps")
        .select("reusable")
        .eq("user_id", user.sub)
        .order("created_at", { ascending: true })
        .limit(9);

      if (!error && data) {
        setStamps(data);
      } else {
        console.error("⚠️ Error loading stamps:", error?.message);
      }
    };

    fetchStamps();

    // ✅ Realtime subscription for new stamps
    const channel = supabase
      .channel("stamps-channel")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "stamps",
          filter: `user_id=eq.${user.sub}`,
        },
        (payload) => {
          console.log("📡 New stamp added:", payload.new);
          setStamps((prev) => [...prev, payload.new].slice(-9));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
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
                {/* ✅ Count */}
                <div className="beans-count">
                  <span>{stamps.length}</span>/<span>9</span>
                </div>

                {/* ✅ Stamp Grid */}
                <div className="stamp-grid" id="stampGrid">
                  {[...Array(9)].map((_, i) => {
                    const stamp = stamps[i];
                    let starSrc = "/images/star-empty.png"; // default empty

                    if (stamp) {
                      starSrc = stamp.reusable
                        ? "/images/green_star.svg" // ✅ reusable cup
                        : "/images/grey_star.svg"; // ❌ disposable cup
                    }

                    return (
                      <div key={i} className="stamp">
                        <img src={starSrc} alt="stamp" className="stamp-icon" />
                      </div>
                    );
                  })}
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
              />
              <div className="qr-display">
                <QRCodeCanvas
                  value={JSON.stringify({ mode: "stamp", userId: user.sub })}
                  size={160}
                />
                <p>Show this QR Code to staff to <br/>collect your stamp</p>
              </div>
            </div>
          </div>

          <DonationCard />
        </div>

        {showIntro && <IntroModal onClose={handleCloseIntro} />}
        <BottomNav stampCount={stamps.length} />
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
