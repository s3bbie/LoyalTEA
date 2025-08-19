// pages/rewards.js
import { useEffect, useState } from "react";
import Head from "next/head";
import { supabase } from "../utils/supabaseClient";
import QrScanner from "qr-scanner";
import withAuth from "../utils/withAuth";

let scannerInstance = null;
let scanHandled = false;

function RewardsPage() {
  const [stampCount, setStampCount] = useState(0);
  const [selectedReward, setSelectedReward] = useState(null);
  const [userId, setUserId] = useState(null);
  const [showScanner, setShowScanner] = useState(false);
  const [scanStatus, setScanStatus] = useState("");

  const SALT = "LOYALTEA_SECRET_SALT";

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

  useEffect(() => {
    const fetchData = async () => {
      const { data: session } = await supabase.auth.getUser();
      if (!session?.user) return (window.location.href = "/");

      const id = session.user.id;
      setUserId(id);

      const { data: profile } = await supabase
        .from("profiles")
        .select("stamp_count")
        .eq("id", id)
        .single();

      setStampCount(profile?.stamp_count || 0);
    };

    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  const generateTodayHash = async () => {
    const today = new Date().toISOString().slice(0, 10);
    const encoder = new TextEncoder();
    const hashBuffer = await crypto.subtle.digest("SHA-256", encoder.encode(SALT + today));
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
  };

  const handleScan = async () => {
    setShowScanner(true);
    setScanStatus("Scan the staff QR code at the till…");

    const todayHash = await generateTodayHash();
    const videoElem = document.getElementById("qr-reader");

    scanHandled = false;

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
          setScanStatus("Redeeming reward…");

          await redeemReward();

          scannerInstance.stop();
          scannerInstance.destroy();
          setTimeout(() => setShowScanner(false), 1500);
        } else {
          setScanStatus("Invalid staff QR code.");
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

const redeemReward = async () => {
  const now = new Date().toISOString();

  console.log("Looking for reward_name =", selectedReward);

  const { data: rewardData, error: rewardFetchError } = await supabase
    .from("reward_prices")
    .select("id")
    .eq("reward_name", selectedReward.trim())
    .maybeSingle();

  if (rewardFetchError || !rewardData) {
    console.error("Reward lookup failed:", rewardFetchError);
    setScanStatus("Could not find reward ID.");
    return;
  }

const rewardId = rewardData.id;
console.log("✅ Found reward ID:", rewardId);

const { error: insertError } = await supabase.from("redeems").insert({
  user_id: userId,
  type: selectedReward,
  count: 1,
  total: 1,
  reward_id: rewardId, 
  created_at: now,
});


  if (insertError) {
    console.error("Redeem insert failed:", insertError);
    setScanStatus("Failed to redeem. Please try again.");
    return;
  }

  const { data: profileData } = await supabase
    .from("profiles")
    .select("stamp_count")
    .eq("id", userId)
    .single();

  const current = profileData?.stamp_count || 0;
  const newCount = Math.max(current - 9, 0);

  await supabase.from("profiles").update({ stamp_count: newCount }).eq("id", userId);

  setStampCount(newCount);
  setScanStatus(`Reward redeemed: ${selectedReward}!`);

  const sound = document.getElementById("rewardSound");
  if (sound) sound.play();
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
              onClick={handleScan}
              disabled={!selectedReward}
            >
              Use at Till
            </button>
          </div>
        )}

        {showScanner && (
          <div className="qr-modal">
            <div className="qr-modal-content">
              <p className="qr-modal-header">Scan Staff QR</p>
              <video id="qr-reader" playsInline></video>
              <p id="scanStatus">{scanStatus}</p>
              <button className="close-btn" onClick={() => setShowScanner(false)}>Cancel</button>
            </div>
          </div>
        )}

        <audio id="rewardSound" src="/sounds/redeem.mp3" preload="auto"></audio>
      </div>
    </>
  );
}

export default withAuth(RewardsPage);
