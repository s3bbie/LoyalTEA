// pages/staff/reports.js
import { useEffect, useState } from "react";
import StaffBottomNav from "../../components/StaffBottomNav";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts";

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

  // fallback placeholder data for charts (so page doesn’t break if API has no data)
  const topDrinks = insights.top_drinks || [
    { name: "Cafe Mocha", count: 12 },
    { name: "Latte", count: 9 },
    { name: "English Breakfast", count: 6 },
  ];

  const stampsTrend = insights.stamps_over_time || [
    { date: "Oct 1", avg: 2.5 },
    { date: "Oct 8", avg: 3.0 },
    { date: "Oct 15", avg: 3.4 },
  ];

  const cupBreakdown = insights.cup_breakdown || {
    reusable: 45,
    non_reusable: 20,
  };

  const revenueTrend = insights.revenue_over_time || [
    { week: "W1", revenue: 6.2 },
    { week: "W2", revenue: 9.1 },
    { week: "W3", revenue: 4.5 },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6 pb-24">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-8">
        <h1 className="text-2xl font-bold mb-4 sm:mb-0 text-gray-800">
          Staff Reports
        </h1>

        <div className="flex items-center gap-3">
          <select
            value={selectedDays}
            onChange={(e) => setSelectedDays(e.target.value)}
            className="border rounded-lg p-2 bg-white shadow-sm text-gray-700"
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

      {/* Overview KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <MetricCard
          title="👥 Total Members"
          value={reports.total_members}
          subtitle={`+${reports.new_members_week} new this week`}
          color="bg-pink-200"
        />
        <MetricCard
          title="🔥 Active Members"
          value={reports.active_members}
          subtitle="(last 30 days)"
          color="bg-orange-200"
        />
        <MetricCard
          title="🎟️ Redemption Rate"
          value={`${reports.redemption_rate}%`}
          subtitle="of total stamps"
          color="bg-green-200"
        />
        <MetricCard
          title="💷 Total Revenue"
          value={`£${insights.total_revenue || "0.00"}`}
          subtitle="via rewards"
          color="bg-blue-200"
        />
      </div>

      {/* Key Insights with Charts */}
      <div className="mb-10">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">
          Key Insights
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Most Redeemed Drinks */}
          <InsightBox title="☕ Most Redeemed Drinks" color="pink">
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={topDrinks}>
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis hide />
                <Tooltip />
                <Bar dataKey="count" fill="#ec4899" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </InsightBox>

          {/* Avg Stamps Trend */}
          <InsightBox title="⭐ Avg Stamps per Active User" color="yellow">
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={stampsTrend}>
                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                <YAxis hide />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="avg"
                  stroke="#facc15"
                  strokeWidth={3}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </InsightBox>

          {/* CO₂ Saved Breakdown */}
          <InsightBox title="🌱 CO₂ Saved Breakdown" color="green">
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={[
                    { name: "Reusable", value: cupBreakdown.reusable },
                    { name: "Disposable", value: cupBreakdown.non_reusable },
                  ]}
                  cx="50%"
                  cy="50%"
                  outerRadius={70}
                  label
                  dataKey="value"
                >
                  <Cell fill="#10b981" />
                  <Cell fill="#f87171" />
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </InsightBox>

          {/* Revenue by Week */}
          <InsightBox title="💷 Revenue by Week" color="blue">
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={revenueTrend}>
                <XAxis dataKey="week" tick={{ fontSize: 12 }} />
                <YAxis hide />
                <Tooltip />
                <Bar dataKey="revenue" fill="#3b82f6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </InsightBox>
        </div>
      </div>

      {/* Top Customers */}
      <div className="mt-10 bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-gray-800">
          👑 <span>Top 5 Customers</span>
        </h3>
        {reports.high_value_customers?.length ? (
          <ul className="divide-y divide-gray-100">
            {reports.high_value_customers.slice(0, 5).map((c, i) => (
              <li
                key={i}
                className="py-3 flex justify-between items-center hover:bg-gray-50 rounded-lg px-2"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-pink-100 flex items-center justify-center text-pink-600 font-medium">
                    {(c.username || c.email || "?")[0].toUpperCase()}
                  </div>
                  <span className="text-gray-700 font-medium">
                    {c.username || c.email || "Anonymous"}
                  </span>
                </div>
                <span className="text-sm text-gray-500">
                  {c.total_spent ? `£${c.total_spent.toFixed(2)}` : ""}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500 text-sm">No customer data available.</p>
        )}
      </div>

      {/* Growth Summary */}
      <div className="mt-10 bg-white border border-gray-100 rounded-2xl p-8 shadow-sm">
        <h2 className="text-xl font-semibold mb-3 text-gray-800">
          📈 Growth Summary
        </h2>
        <p className="text-sm text-gray-500 mb-3">
          Here’s how LoyalTEA has performed in the last {selectedDays} days:
        </p>
        <ul className="space-y-2 text-base text-gray-700">
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

/* ---------- Components ---------- */

function MetricCard({ title, value, subtitle, color }) {
  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all">
      <h3 className="text-sm text-gray-500 mb-1">{title}</h3>
      <h2 className="text-3xl font-bold text-gray-800 mb-1">{value}</h2>
      <p className="text-sm text-gray-400">{subtitle}</p>
      <div className={`mt-2 h-1 w-1/3 rounded-full ${color}`}></div>
    </div>
  );
}

function InsightBox({ title, color, children }) {
  const colorMap = {
    pink: "from-pink-50 border-pink-100",
    yellow: "from-yellow-50 border-yellow-100",
    green: "from-green-50 border-green-100",
    blue: "from-blue-50 border-blue-100",
  };
  return (
    <div
      className={`bg-gradient-to-br ${colorMap[color]} to-white border rounded-2xl p-6 shadow-sm`}
    >
      <h3
        className={`text-md font-semibold mb-4 ${
          {
            pink: "text-pink-600",
            yellow: "text-yellow-600",
            green: "text-green-600",
            blue: "text-blue-600",
          }[color]
        }`}
      >
        {title}
      </h3>
      {children}
    </div>
  );
}
