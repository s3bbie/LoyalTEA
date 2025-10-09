// pages/staff/dashboard.js
import { useEffect, useState } from "react";
import StaffBottomNav from "../../components/StaffBottomNav";
import { Gift, Ticket, Users, Star } from "lucide-react";
import { useSessionContext } from "@supabase/auth-helpers-react";
import { createServerSupabaseClient } from "@supabase/auth-helpers-nextjs";
import { useRouter } from "next/router";

function StaffDashboard({ initialUser }) {
  const { session, isLoading } = useSessionContext();
  const router = useRouter();
  const user = session?.user || initialUser;

const [stats, setStats] = useState({
  totalStamps: 0,
  totalRedemptions: 0,
  totalCustomers: 0,
  outstandingRewards: 0,
  totalRevenue: 0,
  revenueBreakdown: { daily: 0, weekly: 0, monthly: 0 },
  topRedeemedDrinks: [],
  topCustomersByValue: [],
  sustainability_breakdown: {
    reusable_count: 0,
    non_reusable_count: 0,
    reusable_percentage: 0,
  },
});


  // 🚦 redirect only after hydration if no session
  useEffect(() => {
    if (!isLoading && !user) {
      router.replace("/staff/login");
    }
  }, [isLoading, user, router]);

useEffect(() => {
  if (!user) return;

  async function loadStats() {
    try {
      const res = await fetch("/api/staff-stats");
      const data = await res.json();

      setStats({
        totalCustomers: data.total_customers ?? 0,
        totalStamps: data.total_stamps ?? 0,
        outstandingRewards: data.outstanding_rewards ?? 0,
        totalRedemptions: data.total_redemptions ?? 0,
        totalRevenue: data.total_revenue ?? 0,
        revenueBreakdown: data.revenue_breakdown || {
          daily: 0,
          weekly: 0,
          monthly: 0,
        },
        topRedeemedDrinks: data.top_redeemed_drinks || [],
        topCustomersByValue: data.top_customers_by_value || [],
        sustainability_breakdown: data.sustainability_breakdown || {
          reusable_count: 0,
          non_reusable_count: 0,
          reusable_percentage: 0,
        },
      });
    } catch (err) {
      console.error("Dashboard stats error:", err.message);
    }
  }

  loadStats();
}, [user]);


  if (isLoading) {
    return <p>Checking staff session...</p>;
  }

  if (!user) {
    return null; // router will redirect
  }

  const cards = [
    {
      title: "Total Redemptions",
      value: stats.totalRedemptions,
      icon: <Gift className="w-6 h-6" />,
      bg: "bg-pink-500",
    },
    {
      title: "Total Stamps",
      value: stats.totalStamps,
      icon: <Ticket className="w-6 h-6" />,
      bg: "bg-blue-500",
    },
    {
      title: "Total Customers",
      value: stats.totalCustomers,
      icon: <Users className="w-6 h-6" />,
      bg: "bg-green-500",
    },
    {
      title: "Outstanding Rewards",
      value: stats.outstandingRewards,
      icon: <Star className="w-6 h-6" />,
      bg: "bg-yellow-500",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-100 p-6 pb-24">
      <h1 className="text-2xl font-bold mb-6">Staff Dashboard</h1>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {cards.map((card) => (
          <div
            key={card.title}
            className="p-6 rounded-xl bg-white shadow flex items-center justify-between"
          >
            <div>
              <p className="text-sm font-medium text-gray-500">{card.title}</p>
              <h2 className="text-3xl font-bold text-gray-800">{card.value}</h2>
            </div>
            <div className={`p-3 rounded-full ${card.bg} text-white`}>
              {card.icon}
            </div>
          </div>
        ))}
      </div>

      {/* Second row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="text-lg font-bold mb-2">Top Redeemed Drinks</h2>
          {stats.topRedeemedDrinks?.length > 0 ? (
            <ul className="text-sm text-gray-700">
              {stats.topRedeemedDrinks.map((drink, idx) => (
                <li key={idx} className="flex justify-between">
                  <span>{drink.reward_name}</span>
                  <span>{drink.redeemed_count}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-600 text-sm">No data yet.</p>
          )}
        </div>

        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="text-lg font-bold mb-2">Top Customers by Value</h2>
          {stats.topCustomersByValue?.length > 0 ? (
            <ul className="text-sm text-gray-700">
              {stats.topCustomersByValue.map((cust, idx) => (
                <li key={idx} className="flex justify-between">
                  <span>{cust.username}</span>
                  <span>£{cust.total_value}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-600 text-sm">No data yet.</p>
          )}
        </div>
      </div>

      {/* Third row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="text-lg font-bold mb-2">Total Revenue</h2>
          <p className="text-2xl font-bold text-green-600">
            £{stats.totalRevenue}
          </p>
          <div className="flex justify-between text-sm text-gray-500 mt-4">
            <span>Daily £{stats.revenueBreakdown?.daily ?? 0}</span>
            <span>Weekly £{stats.revenueBreakdown?.weekly ?? 0}</span>
            <span>Monthly £{stats.revenueBreakdown?.monthly ?? 0}</span>
          </div>
        </div>

{/* Sustainability breakdown */}
<div className="bg-white p-6 rounded-xl shadow">
  <h2 className="text-lg font-bold mb-2">Sustainability Breakdown</h2>
  <p className="text-2xl font-bold text-green-600">
    {stats.sustainability_breakdown?.reusable_percentage ?? 0}% reusable
  </p>
  <div className="flex justify-between text-sm text-gray-500 mt-4">
    <span>Reusable: {stats.sustainability_breakdown?.reusable_count ?? 0}</span>
    <span>Disposable: {stats.sustainability_breakdown?.non_reusable_count ?? 0}</span>
  </div>
</div>

      </div>
      

      <StaffBottomNav />
    </div>
  );
}

// ✅ SSR — don’t hard redirect if no session
export async function getServerSideProps(ctx) {
  const supabase = createServerSupabaseClient(ctx);
  const {
    data: { session },
  } = await supabase.auth.getSession();

  return {
    props: {
      initialUser: session ? session.user : null,
    },
  };
}

export default StaffDashboard;
