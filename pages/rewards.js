// pages/rewards.js
import { useEffect, useState } from "react";
import Head from "next/head";
import { supabase } from "../utils/supabaseClient";
import jwt from "jsonwebtoken";
import * as cookie from "cookie";
import BottomNav from "../components/BottomNav";
import { QRCodeCanvas } from "qrcode.react";

function RewardsPage({ user }) {
  const [stampCount, setStampCount] = useState(0);
  const [selectedReward, setSelectedReward] = useState(null);
  const [showQR, setShowQR] = useState(false);

  const rewards = [
    { title: "Normal Tea", subtitle: "Classic blend", value: "Cafe Tea", image: "/images/drinks/tea.jpg" },
    { title: "Special Tea", subtitle: "Unique infusion", value: "Cafe Speciality Tea", image: "/images/drinks/specialtea.jpg" },
    { title: "Double Espresso", subtitle: "Strong & intense", value: "Double Espresso", image: "/images/drinks/espresso.jpg" },
    { title: "Flat White", subtitle: "Smooth & bold", value: "Flat White", image: "/images/drinks/flatwhite.jpg" },
    { title: "Americano", subtitle: "Rich and clean", value: "Americano", image: "/images/drinks/americano.jpg" },
    { title: "Latte", subtitle: "Creamy and smooth", value: "Cafe Latte", image: "/images/drinks/latte.jpg" },
    { title: "Cappuccino", subtitle: "Foamy delight", value: "Cappuccino", image: "/images/drinks/cappuccino.jpg" },
    { title: "Mocha", subtitle: "Coffee & chocolate", value: "Cafe Mocha", image: "/images/drinks/mocha.jpg" },
    { title: "Hot Chocolate", subtitle: "Sweet & comforting", value: "Hot Chocolate", image: "/images/drinks/hotchocolate.jpg" },
    { title: "Chai Latte", subtitle: "Spiced & aromatic", value: "Chai Latte", image: "/images/drinks/chailatte.jpg" }
  ];

  // fetch user's stamp count
  useEffect(() => {
    const fetchStampCount = async () => {
      const { data, error } = await supabase
        .from("users")
        .select("stamp_count")
        .eq("id", user.sub)
        .single();

      if (!error && data) {
        setStampCount(data.stamp_count || 0);
      } else {
        console.error("⚠️ Error fetching stamp count:", error?.message);
      }
    };

    fetchStampCount();
    const interval = setInterval(fetchStampCount, 5000);
    return () => clearInterval(interval);
  }, [user.sub]);

  const handleUseReward = () => {
    if (!selectedReward) return;
    setShowQR(true);
  };

  return (
    <>
      <Head>
        <title>LoyalTEA – Rewards</title>
      </Head>

      <div id="pageWrapper" className="rewards-page">
        <div className="rewards-banner">
          <h1 className="banner-title">YOUR <span>REWARDS</span></h1>
          <p className="banner-subtitle">Treat Yourself</p>
          <p className="rewards-recent-label">Choose rewards to use</p>
        </div>

        {stampCount < 9 ? (
          <div id="emptyStateMsg">No rewards yet! Earn 9 stamps for a free drink.</div>
        ) : (
          <div className="rewards-container">
            <form className="rewards-group">
              {rewards.map((item, index) => (
                <label key={index} className={`reward-card ${selectedReward === item.value ? "selected" : ""}`}>
                  <div className="reward-card-left">
                    <img src={item.image} className="reward-icon round" alt={item.title} />
                    <div className="reward-text">
                      <p className="reward-title">{item.title}</p>
                      <p className="reward-subtext">{item.subtitle}</p>
                    </div>
                  </div>
                  <input
                    type="radio"
                    name="reward"
                    value={item.value}
                    checked={selectedReward === item.value}
                    onChange={() => setSelectedReward(item.value)}
                  />
                  <span className="custom-radio"></span>
                </label>
              ))}
            </form>
            <button
              className="use-btn"
              type="button"
              onClick={handleUseReward}
              disabled={!selectedReward}
            >
              Use at Till
            </button>
          </div>
        )}

        {/* ✅ QR fullscreen when using reward */}
        {showQR && (
          <div className="qr-fullscreen">
            <button className="qr-close-x" onClick={() => setShowQR(false)}>✕</button>
            <div className="qr-display">
              <QRCodeCanvas
                value={JSON.stringify({
                  userId: user.sub,
                  reward: selectedReward,
                })}
                size={240}
              />
              <p>Show this QR Code to staff to redeem your reward</p>
            </div>
          </div>
        )}

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

export default RewardsPage;
