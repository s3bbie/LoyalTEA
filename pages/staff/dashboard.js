import { useEffect, useState } from "react";
import { supabase } from "../../utils/supabaseClient";
import StaffBottomNav from "../../components/StaffBottomNav";
import { Gift, Ticket, Users, Star } from "lucide-react";

export default function StaffDashboard() {
  const [stats, setStats] = useState({
    totalStamps: 0,
    totalRedemptions: 0,
    totalCustomers: 0,
    outstandingRewards: 0,
    totalRevenue: 0,
    revenueBreakdown: { daily: 0, weekly: 0, monthly: 0 },
    topRedeemedDrinks: [],
    topCustomersByValue: [],
  });

useEffect(() => {
  async function loadStats() {
    try {
      const res = await fetch("/api/staff-stats");
      const data = await res.json();
      setStats({
        totalCustomers: data.total_customers,
        totalStamps: data.total_stamps,
        outstandingRewards: data.outstanding_rewards,
        totalRedemptions: data.total_redemptions,
        totalRevenue: data.total_revenue,
        revenueBreakdown: data.revenue_breakdown,
        topRedeemedDrinks: data.top_redeemed_drinks,
        topCustomersByValue: data.top_customers_by_value,
      });
    } catch (err) {
      console.error("Dashboard stats error:", err.message);
    }
  }
  loadStats();
}, []);



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
{stats.topRedeemedDrinks.length > 0 ? (
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
          {stats.topCustomersByValue.length > 0 ? (
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
            <span>Daily £{stats.revenueBreakdown.daily}</span>
            <span>Weekly £{stats.revenueBreakdown.weekly}</span>
            <span>Monthly £{stats.revenueBreakdown.monthly}</span>
          </div>
        </div>
      </div>

      <StaffBottomNav />
    </div>
  );
}
