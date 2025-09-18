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
  const [dbUserId, setDbUserId] = useState(null); // ✅ Supabase row id
  const [rewards, setRewards] = useState([]);
  const [selectedReward, setSelectedReward] = useState(null);
  const [showQR, setShowQR] = useState(false);

  // fetch user's stamp count + rewards list
  useEffect(() => {
    const fetchData = async () => {
      // ✅ fetch user row using username (same as home.js)
      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("id, stamp_count")
        .eq("username", user.username)
        .single();

      if (!userError && userData) {
        setDbUserId(userData.id);
        setStampCount(userData.stamp_count || 0);
      } else {
        console.error("⚠️ Error fetching user row:", userError?.message);
      }

      // fetch reward list
      const { data: rewardsData, error: rewardsError } = await supabase
        .from("reward_prices")
        .select("id, reward_name, price, image_url, category");

      if (!rewardsError && rewardsData) {
        setRewards(rewardsData);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, [user.username]);

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
        {rewards.filter((item) => stampCount >= 9).length === 0 ? (
          <div className="text-center text-gray-700 mt-8 font-medium">
            No rewards yet! Collect more stamps to unlock a free drink.
          </div>
        ) : (
          <div className="max-w-2xl w-full mx-auto px-4 py-8 pb-24">
            <form className="space-y-4">
              {rewards
                .filter((item) => stampCount >= 9) // ✅ unlock when 9 stamps
                .map((item) => (
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
        {showQR && dbUserId && (
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
                  userId: dbUserId, // ✅ Supabase row id
                  rewardId: selectedReward,
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
