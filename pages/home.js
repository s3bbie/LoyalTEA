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
import Co2Equivalents from "../components/Co2Equivalents";

function IntroModal({ onClose }) {
  const handleClose = () => {
    localStorage.setItem("introSeen", "true");
    onClose();
  };

  return (
    <div className="modal">
      <div className="modal-content">
        <span className="close" onClick={handleClose}>
          ×
        </span>
        <h2>Welcome to LoyalTEA ☕</h2>
        <p>
          Collect stamps every time you buy at the canteen. Once you reach 9,
          redeem a free drink 🎉
        </p>
        <button className="btn-primary" onClick={handleClose}>
          Got it!
        </button>
      </div>
    </div>
  );
}

function Home({ user }) {
  const [stampCount, setStampCount] = useState(0);
  const [stamps, setStamps] = useState([]);
  const [dbUserId, setDbUserId] = useState(null);
  const [showQR, setShowQR] = useState(false);
  const [showIntro, setShowIntro] = useState(false);
  const [totalCo2, setTotalCo2] = useState(0);

  useEffect(() => {
    if (!localStorage.getItem("introSeen")) {
      setShowIntro(true);
    }

    const fetchData = async () => {
      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("id, stamp_count, total_co2_saved")
        .eq("username", user.username)
        .single();

      if (!userError && userData) {
        setDbUserId(userData.id);
        setStampCount(userData.stamp_count || 0);
        setTotalCo2(userData.total_co2_saved ?? 0);
      } else {
        console.error("⚠️ Error fetching user row:", userError?.message);
      }

      if (userData?.id) {
        const { data: stampsData, error: stampsError } = await supabase
          .from("stamps")
          .select("*")
          .eq("user_id", userData.id)
          .order("created_at", { ascending: true });

        if (!stampsError && stampsData) {
          setStamps(stampsData);
        }
      }
    };

    fetchData();

    // ✅ Realtime subscriptions for all user updates
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
            console.log("📡 user row updated:", payload.new);
            setStampCount(payload.new.stamp_count);
            setTotalCo2(payload.new.total_co2_saved ?? 0);
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
            setStamps((prev) =>
              [...prev, payload.new].sort(
                (a, b) => new Date(a.created_at) - new Date(b.created_at)
              )
            );
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user.username, dbUserId]);

  return (
    <>
      <Head>
        <title>Home – LoyalTEA</title>
      </Head>

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
                          className={`stamp ${
                            stamps[i]?.reusable ? "reusable" : "non-reusable"
                          }`}
                        />
                      );
                    } else {
                      return <div key={i} className="stamp" />;
                    }
                  })}
                </div>
              </div>

              {/* ✅ Lifetime CO₂ saved */}
              <div className="co2-saved-text mt-3 text-center">
                <Co2Equivalents co2Saved={totalCo2} />
              </div>
            </section>
          </div>

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
                    value={JSON.stringify({ mode: "stamp", userId: dbUserId })}
                    size={160}
                  />
                  <p>
                    Show this QR Code to staff to <br />
                    collect your stamp
                  </p>
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
