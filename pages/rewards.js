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

      <div className="min-h-screen bg-gray-100 flex flex-col">
        {/* Pink header like Menu */}
        <div className="bg-brandPink text-white text-center py-8 rounded-b-3xl shadow-md">
          <h1 className="text-3xl font-extrabold tracking-wide">
            YOUR <span>REWARDS</span>
          </h1>
          <p className="text-sm mt-2 opacity-90">Treat Yourself</p>
          <p className="text-base mt-1 font-medium">Choose rewards to use</p>
        </div>

        {/* Rewards section */}
        {stampCount < 9 ? (
          <div className="text-center text-gray-700 mt-8 font-medium">
            No rewards yet! Earn 9 stamps for a free drink.
          </div>
        ) : (
          <div className="max-w-2xl w-full mx-auto px-4 py-8 pb-24">
            <form className="space-y-4">
              {rewards.map((item) => (
  <label
    key={item.id}
    className={`bg-white rounded-xl shadow-md flex items-center p-4 cursor-pointer ${
      selectedReward === item.id
        ? "ring-2 ring-pink-600"
        : "hover:shadow-lg"
    }`}
  >
    {/* Circle image */}
    {item.image_url && (
      <img
        src={item.image_url}
        alt={item.reward_name}
        className="w-16 h-16 object-cover rounded-full mr-4"
      />
    )}

    {/* Text */}
    <div className="flex flex-col flex-grow">
      <p className="text-base font-semibold text-gray-800">
        {item.reward_name}
      </p>
      {item.category && (
        <p className="text-xs text-gray-500">{item.category}</p>
      )}

      {/* Normal price */}
      <p className="text-sm font-bold text-pink-700 mt-1">
        £{parseFloat(item.price).toFixed(2)}
      </p>

      {/* ♻️ Discount badge */}
      <span className="mt-1 inline-block bg-green-100 text-green-800 text-xs font-semibold px-2 py-1 rounded-full">
        ♻️ Bring your own cup: £{(parseFloat(item.price) - 0.1).toFixed(2)}
      </span>

      {/* Screen reader support */}
      <p className="sr-only">
        Save ten pence if you bring your own cup. Normal price{" "}
        {parseFloat(item.price).toFixed(2)} pounds. Discounted price{" "}
        {(parseFloat(item.price) - 0.1).toFixed(2)} pounds.
      </p>
    </div>

    {/* Radio input */}
    <input
      type="radio"
      name="reward"
      value={item.id}
      checked={selectedReward === item.id}
      onChange={() => setSelectedReward(item.id)}
      className="hidden"
    />
    <span
      className={`w-5 h-5 rounded-full border-2 ml-2 ${
        selectedReward === item.id
          ? "bg-pink-600 border-pink-600"
          : "border-gray-400"
      }`}
    ></span>
  </label>
))}

            </form>

            {/* Button */}
            <button
              className="mt-6 w-full bg-pink-700 text-white font-semibold py-3 rounded-xl shadow-md disabled:opacity-50"
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
          <div className="qr-fullscreen fixed inset-0 bg-black bg-opacity-80 flex flex-col items-center justify-center z-50">
            <button
              className="absolute top-4 right-4 text-black text-2xl"
              onClick={() => setShowQR(false)}
            >
              ✕
            </button>
            <div className="bg-white p-6 rounded-2xl flex flex-col items-center">
              <QRCodeCanvas
                value={JSON.stringify({
                  mode: "reward",
                  userId: user.sub,
                  rewardId: selectedReward, // 👈 sending reward_id
                })}
                size={240}
              />
              <p className="mt-4 text-gray-700 text-center">
                Show this QR Code to staff to redeem your reward
              </p>
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
