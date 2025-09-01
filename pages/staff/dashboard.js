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
  });

  useEffect(() => {
    async function loadStats() {
      try {
        const { data: usersData, error: usersError } = await supabase
          .from("users")
          .select("stamp_count, id, role");

        if (usersError) throw usersError;

        const totalStamps = usersData.reduce(
          (sum, u) => sum + (u.stamp_count || 0),
          0
        );
        const totalCustomers = usersData.filter((u) => u.role !== "staff").length;
        const outstandingRewards = usersData.filter((u) => u.stamp_count >= 9).length;

        const { count: redemptionsCount, error: redeemsError } = await supabase
          .from("redeems")
          .select("*", { count: "exact", head: true })
          .eq("type", "reward");

        if (redeemsError) throw redeemsError;

        setStats({
          totalStamps,
          totalRedemptions: redemptionsCount || 0,
          totalCustomers,
          outstandingRewards,
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
    
    <div className="min-h-screen bg-gray-100 p-6">
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
          <h2 className="text-lg font-bold text-red-600 mb-2">⚠️ Suspicious Activity</h2>
          <p className="text-gray-600">No suspicious activity detected.</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="text-lg font-bold mb-2">Top Repeat Users</h2>
          <p className="text-gray-600">No repeat users found.</p>
        </div>
      </div>

      {/* Third row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="text-lg font-bold mb-2">Top Redeemed Drinks</h2>
          <p className="text-gray-600 text-sm">No data yet.</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="text-lg font-bold mb-2">Top Customers by Value</h2>
          <p className="text-gray-600 text-sm">No data yet.</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="text-lg font-bold mb-2">Total Revenue</h2>
          <p className="text-2xl font-bold text-green-600">£0.00</p>
          <div className="flex justify-between text-sm text-gray-500 mt-4">
            <span>Daily £0.00</span>
            <span>Weekly £0.00</span>
            <span>Monthly £0.00</span>
          </div>
        </div>
      </div>

      <StaffBottomNav />
    </div>
  );
}
