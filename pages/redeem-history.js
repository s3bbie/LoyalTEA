// pages/redeem-history.js
import { useEffect, useState } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import { supabase } from "../utils/authClient";
import { useSessionContext } from "@supabase/auth-helpers-react";
import BottomNav from "../components/BottomNav";

export default function RedeemHistory() {
  const { session, isLoading } = useSessionContext();
  const router = useRouter();

  const [redeems, setRedeems] = useState([]);
  const [tab, setTab] = useState("all");
  const user = session?.user || null;

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace("/");
    }
  }, [isLoading, user, router]);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;

      // ✅ pull reusable flag directly from redeems table
      const { data: redeemsData, error: redeemErr } = await supabase
        .from("redeems")
        .select("id, created_at, reward_id, reusable")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (redeemErr) {
        console.error("Redeems error:", redeemErr);
        return;
      }

      // Get reward names
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

      const redeemsWithNames = redeemsData.map((r) => ({
        ...r,
        reward_name: rewardMap[r.reward_id] || "Unknown item",
      }));

      setRedeems(redeemsWithNames);
    };

    fetchData();
  }, [user]);

  const reusableCount = redeems.filter((r) => r.reusable).length;
  const nonReusableCount = redeems.filter((r) => r.reusable === false).length;

  if (isLoading) return <p>Loading session...</p>;
  if (!user) return null;

  return (
    <>
      <Head>
        <title>Redeem History</title>
      </Head>

      {/* ✅ Match Menu/Rewards header style */}
      <header className="bg-pink-600 text-white text-center py-6 rounded-b-2xl shadow">
        <h1 className="text-2xl font-bold">Redeem History</h1>
        <p className="text-sm mt-1">Track your past rewards & impact</p>
      </header>

      <div className="p-4 space-y-6 bg-white min-h-screen">
        {/* Tabs */}
        <div className="flex justify-center gap-3">
          <button
            onClick={() => setTab("all")}
            className={`px-4 py-2 rounded-full text-sm font-medium ${
              tab === "all" ? "bg-pink-600 text-white" : "bg-gray-200"
            }`}
          >
            All
          </button>
          <button
            onClick={() => setTab("reusable")}
            className={`px-4 py-2 rounded-full text-sm font-medium ${
              tab === "reusable" ? "bg-green-600 text-white" : "bg-gray-200"
            }`}
          >
            Reusable ({reusableCount})
          </button>
          <button
            onClick={() => setTab("nonreusable")}
            className={`px-4 py-2 rounded-full text-sm font-medium ${
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

        {/* Redeemed items list */}
        <ul className="space-y-3">
          {redeems.length === 0 && (
            <li className="text-sm text-gray-600 text-center py-4">
              No redemptions yet.
            </li>
          )}
          {redeems
            .filter((item) => {
              if (tab === "reusable") return item.reusable === true;
              if (tab === "nonreusable") return item.reusable === false;
              return true;
            })
            .map((item) => (
              <li
                key={item.id}
                className="flex items-center justify-between border-b pb-2"
              >
                <div>
                  <p className="font-medium text-gray-800">
                    Redeemed {item.reward_name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {new Date(item.created_at).toLocaleDateString()}
                  </p>
                </div>

                {/* ✅ Indicator badge */}
                <span
                  className={`px-3 py-1 text-xs rounded-full font-semibold ${
                    item.reusable
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {item.reusable ? "Reusable" : "Non-Reusable"}
                </span>
              </li>
            ))}
        </ul>
      </div>

      <BottomNav />
    </>
  );
}
