// pages/staff/reports.js
import { useEffect, useState } from "react";
import StaffBottomNav from "../../components/StaffBottomNav";

export default function StaffReports() {
  const [reports, setReports] = useState(null);
  const [selectedDays, setSelectedDays] = useState("30");
  const [loading, setLoading] = useState(false);

  // Fetch reports
  async function fetchReports() {
    try {
      setLoading(true);
      const res = await fetch(`/api/staff-reports?days=${selectedDays}`);
      const data = await res.json();
      if (res.ok) setReports(data);
      else console.error("API error:", data.error);
    } catch (err) {
      console.error("Fetch failed:", err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchReports();
  }, [selectedDays]);

  if (loading) return <p className="p-6">Loading reports...</p>;
  if (!reports) return <p className="p-6">No reports available.</p>;

  const insights = reports.insights || {};

  return (
    <div className="min-h-screen bg-gray-50 p-6 pb-24">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-8">
        <h1 className="text-2xl font-bold mb-4 sm:mb-0">Staff Reports</h1>

        <div className="flex items-center gap-3">
          <select
            value={selectedDays}
            onChange={(e) => setSelectedDays(e.target.value)}
            className="border rounded-lg p-2"
          >
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
            <option value="all">All time</option>
          </select>

          <button
            onClick={fetchReports}
            className="bg-pink-600 hover:bg-pink-700 text-white px-4 py-2 rounded-lg transition"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <MetricCard
          title="👥 Total Members"
          value={reports.total_members}
          subtitle={`+${reports.new_members_week} new this week`}
          color="bg-gradient-to-r from-pink-500 to-pink-400"
        />
        <MetricCard
          title="🔥 Active Members"
          value={reports.active_members}
          subtitle="(last 30 days)"
          color="bg-gradient-to-r from-orange-400 to-orange-300"
        />
        <MetricCard
          title="🎟️ Redemption Rate"
          value={`${reports.redemption_rate}%`}
          subtitle="of total stamps"
          color="bg-gradient-to-r from-green-400 to-emerald-300"
        />
        <MetricCard
          title="💷 Total Revenue"
          value={`£${insights.total_revenue || "0.00"}`}
          subtitle="via rewards"
          color="bg-gradient-to-r from-blue-500 to-blue-400"
        />
      </div>

      {/* Insights Section */}
      <div className="bg-white rounded-2xl shadow p-8 space-y-6">
        <h2 className="text-xl font-semibold mb-4">Key Insights</h2>

        <InsightItem
          emoji="☕"
          label="Most Redeemed Drink"
          value={insights.most_redeemed_drink || "No data"}
          desc="The drink customers love the most!"
        />

        <InsightItem
          emoji="⭐"
          label="Avg Stamps per Active User"
          value={insights.avg_stamps_per_active || "0"}
          desc="Average number of stamps earned by active members."
        />

        <InsightItem
          emoji="🌱"
          label="Total CO₂ Saved"
          value={`${insights.co2_saved_kg || 0} kg`}
          desc="Based on reusable cup usage data."
        />

        <InsightItem
          emoji="👑"
          label="Top Customers"
          value={
            reports.high_value_customers?.length
              ? reports.high_value_customers
                  .slice(0, 3)
                  .map((c) => c.username || c.email || "Anonymous")
                  .join(", ")
              : "No data"
          }
          desc="Your highest-spending loyalty members."
        />
      </div>

      {/* Growth Summary */}
      <div className="mt-10 bg-gradient-to-r from-pink-600 to-pink-500 text-white rounded-2xl p-8 shadow-lg">
        <h2 className="text-xl font-semibold mb-3">📈 Growth Summary</h2>
        <p className="text-sm opacity-90 mb-3">
          Here’s how LoyalTEA has performed in the last {selectedDays} days:
        </p>
        <ul className="space-y-2 text-base">
          <li>👥 <b>{reports.total_members}</b> total members</li>
          <li>🔥 <b>{reports.active_members}</b> active this period</li>
          <li>🎁 <b>{reports.redemption_rate}%</b> redemption activity</li>
          <li>🌱 <b>{insights.co2_saved_kg} kg</b> CO₂ saved</li>
        </ul>
      </div>

      <StaffBottomNav />
    </div>
  );
}

// Components
function MetricCard({ title, value, subtitle, color }) {
  return (
    <div
      className={`${color} text-white p-6 rounded-2xl shadow-md transform hover:scale-[1.02] transition-all`}
    >
      <h3 className="text-sm opacity-90 mb-1">{title}</h3>
      <h2 className="text-3xl font-bold mb-1">{value}</h2>
      <p className="text-sm opacity-80">{subtitle}</p>
    </div>
  );
}

function InsightItem({ emoji, label, value, desc }) {
  return (
    <div className="flex items-start justify-between border-b border-gray-100 pb-4">
      <div>
        <h3 className="font-semibold text-gray-800">
          {emoji} {label}
        </h3>
        <p className="text-sm text-gray-500">{desc}</p>
      </div>
      <span className="text-lg font-bold text-gray-800">{value}</span>
    </div>
  );
}
