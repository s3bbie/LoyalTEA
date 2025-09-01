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
  const [rewards, setRewards] = useState([]);
  const [selectedReward, setSelectedReward] = useState(null);
  const [showQR, setShowQR] = useState(false);

  // fetch user's stamp count + rewards list
  useEffect(() => {
    const fetchData = async () => {
      const { data: userData } = await supabase
        .from("users")
        .select("stamp_count")
        .eq("id", user.sub)
        .single();

      if (userData) setStampCount(userData.stamp_count || 0);

      const { data: rewardsData } = await supabase
        .from("reward_prices")
        .select("id, reward_name, price, image_url, category");

      if (rewardsData) setRewards(rewardsData);
    };

    fetchData();
    const interval = setInterval(fetchData, 5000);
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
          <div id="emptyStateMsg">
            No rewards yet! Earn 9 stamps for a free drink.
          </div>
        ) : (
          <div className="rewards-container">
            <form className="rewards-group">
              {rewards.map((item) => (
                <label
                  key={item.id}
                  className={`reward-card ${
                    selectedReward === item.id ? "selected" : ""
                  }`}
                >
                  <div className="reward-card-left">
                    <img
                      src={item.image_url}
                      className="reward-icon round"
                      alt={item.reward_name}
                    />
                    <div className="reward-text">
                      <p className="reward-title">{item.reward_name}</p>
                      <p className="reward-subtext">
                        {item.category} – £{item.price.toFixed(2)}
                      </p>
                    </div>
                  </div>
                  <input
                    type="radio"
                    name="reward"
                    value={item.id}
                    checked={selectedReward === item.id}
                    onChange={() => setSelectedReward(item.id)}
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
            <button className="qr-close-x" onClick={() => setShowQR(false)}>
              ✕
            </button>
            <div className="qr-display">
              <QRCodeCanvas
                value={JSON.stringify({
                  mode: "reward",
                  userId: user.sub,
                  rewardId: selectedReward, // 👈 sending reward_id, not name
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
