// pages/home.js
import { useEffect, useState } from "react";
import Head from "next/head";
import BottomNav from "../components/BottomNav";
import jwt from "jsonwebtoken";
import * as cookie from "cookie";
import { supabase } from "../utils/supabaseClient";
import { QRCodeCanvas } from "qrcode.react";
import DonationCard from "../components/DonationCard";
import RecyclingStats from "../components/RecyclingStats";

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
  const [stamps, setStamps] = useState([]);
  const [dbUserId, setDbUserId] = useState(null); // ✅ Supabase users.id
  const [showQR, setShowQR] = useState(false);
  const [showIntro, setShowIntro] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem("introSeen")) {
      setShowIntro(true);
    }

    const fetchData = async () => {
      // 1. Fetch full user row (to get Supabase id)
      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("id, stamp_count")
        .eq("username", user.username) // match on username
        .single();

      if (!userError && userData) {
        setDbUserId(userData.id); // ✅ store Supabase id
        setStampCount(userData.stamp_count || 0);
      } else {
        console.error("⚠️ Error fetching user row:", userError?.message);
      }

      // 2. Fetch stamps for reusable stats
      if (userData?.id) {
        const { data: stampsData, error: stampsError } = await supabase
          .from("stamps")
          .select("*")
          .eq("user_id", userData.id);

        if (!stampsError && stampsData) {
          setStamps(stampsData);
        }
      }
    };

    fetchData();

    // ✅ Realtime subscriptions
    if (user.username) {
      const channel = supabase
        .channel("home-live")
        .on(
          "postgres_changes",
          {
            event: "UPDATE",
            schema: "public",
            table: "users",
            filter: `username=eq.${user.username}`,
          },
          (payload) => {
            console.log("📡 stamp_count updated:", payload.new.stamp_count);
            setStampCount(payload.new.stamp_count);
          }
        )
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "stamps",
            filter: `user_id=eq.${dbUserId}`,
          },
          (payload) => {
            console.log("📡 New stamp added:", payload.new);
            setStamps((prev) => [...prev, payload.new]);
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user.username, dbUserId]);

  // ✅ reusable count still comes from stamps
  const reusableCount = stamps.filter((s) => s.reusable).length;
  const co2Saved = reusableCount * 15; // grams saved

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
                  {[...Array(9)].map((_, i) => {
                    if (i < stampCount) {
                      return (
                        <div
                          key={i}
                          className={`stamp ${stamps[i]?.reusable ? "reusable" : "non-reusable"}`}
                        />
                      );
                    } else {
                      return <div key={i} className="stamp" />;
                    }
                  })}
                </div>
              </div>

              {/* ✅ CO₂ text below the stars */}
              <div className="co2-saved-text">
                {reusableCount > 0 ? (
                  <p>🌍 You’ve saved <strong>{co2Saved}g CO₂</strong> by using reusable cups!</p>
                ) : (
                  <p>Start using reusable cups to save CO₂ 🌱</p>
                )}
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

            {dbUserId && (
              <div className="qr-content">
                <button
                  className="qr-close-inline"
                  onClick={() => setShowQR(false)}
                />
                <div className="qr-display">
                  <QRCodeCanvas
                    value={JSON.stringify({ mode: "stamp", userId: dbUserId })} // ✅ REAL Supabase id
                    size={160}
                  />
                  <p>Show this QR Code to staff to <br/>collect your stamp</p>
                </div>
              </div>
            )}
          </div>

          <DonationCard />
          <RecyclingStats />
        </div>

        {showIntro && <IntroModal onClose={() => setShowIntro(false)} />}
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
