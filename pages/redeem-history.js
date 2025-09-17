// pages/redeem-history.js
import { useEffect, useState } from "react";
import Head from "next/head";
import { supabase } from "../utils/supabaseClient";
import BottomNav from "../components/BottomNav";
import jwt from "jsonwebtoken";
import * as cookie from "cookie";

export default function RedeemHistory({ user }) {
  const [redeems, setRedeems] = useState([]);
  const [stamps, setStamps] = useState([]);
  const [tab, setTab] = useState("all");

  useEffect(() => {
    if (!user?.sub) return;

    const fetchData = async () => {
      // 1. Get redeems
      const { data: redeemsData, error: redeemErr } = await supabase
        .from("redeems")
        .select("id, created_at, reward_id")
        .eq("user_id", user.sub)
        .order("created_at", { ascending: false });

      if (redeemErr) {
        console.error("Redeems error:", redeemErr);
        return;
      }

      // 2. Get all rewards into a map
      const { data: rewards, error: rewardsErr } = await supabase
        .from("reward_prices")
        .select("id, reward_name");

      if (rewardsErr) {
        console.error("Rewards error:", rewardsErr);
        return;
      }

      const rewardMap = Object.fromEntries(
        rewards.map((r) => [r.id, r.reward_name])
      );

      // 3. Attach reward names
      const redeemsWithNames = redeemsData.map((r) => ({
        ...r,
        reward_name: rewardMap[r.reward_id] || "Unknown item",
      }));

      setRedeems(redeemsWithNames);

      // Stamps for reusable stats
      const { data: stampsData, error: stampsErr } = await supabase
        .from("stamps")
        .select("reusable")
        .eq("user_id", user.sub);

      if (stampsErr) console.error("Stamps error:", stampsErr);

      setStamps(stampsData || []);
    };

    fetchData();
  }, [user?.sub]);

  const reusableCount = stamps.filter((s) => s.reusable).length;
  const nonReusableCount = stamps.filter((s) => !s.reusable).length;

  if (!user) {
    return <p className="p-4">Loading...</p>;
  }

  return (
    <>
      <Head><title>Redeem History</title></Head>

      <header className="register-header-block">
        <h1 className="settings-title">Redeem History</h1>
      </header>

      <div className="p-4 space-y-6">
        {/* Tabs */}
        <div className="flex justify-center gap-4">
          <button
            onClick={() => setTab("all")}
            className={`px-4 py-2 rounded ${
              tab === "all" ? "bg-pink-600 text-white" : "bg-gray-200"
            }`}
          >
            All
          </button>
          <button
            onClick={() => setTab("reusable")}
            className={`px-4 py-2 rounded ${
              tab === "reusable" ? "bg-green-600 text-white" : "bg-gray-200"
            }`}
          >
            Reusable ({reusableCount})
          </button>
          <button
            onClick={() => setTab("nonreusable")}
            className={`px-4 py-2 rounded ${
              tab === "nonreusable" ? "bg-red-600 text-white" : "bg-gray-200"
            }`}
          >
            Non-Reusable ({nonReusableCount})
          </button>
        </div>

        {/* Impact summary */}
        <div className="bg-gray-100 p-4 rounded-xl text-center">
          <p className="text-lg font-semibold">Your CO₂ Impact</p>
          <p className="text-sm text-gray-700 mt-2">
            {reusableCount > 0
              ? `You saved approx. ${(reusableCount * 0.2).toFixed(
                  1
                )}kg CO₂ by using reusable mugs.`
              : "Start using reusable mugs to save CO₂ 🌍"}
          </p>
        </div>

        {/* Redeemed items history */}
        <ul className="space-y-3">
          {redeems.length === 0 && (
            <li className="text-sm text-gray-600 text-center py-4">
              No redemptions yet.
            </li>
          )}
          {redeems.map((item) => (
            <li key={item.id} className="border-b pb-2">
              <p className="font-medium">
                Redeemed {item.reward_name}
              </p>
              <p className="text-xs text-gray-500">
                {new Date(item.created_at).toLocaleDateString()}
              </p>
            </li>
          ))}
        </ul>
      </div>

      <BottomNav />
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
  } catch {
    return { redirect: { destination: "/", permanent: false } };
  }
}
