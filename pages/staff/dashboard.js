import { useEffect, useState } from "react";
import { supabase } from "../../utils/supabaseClient";
import StaffBottomNav from "../../components/StaffBottomNav";

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

        const totalStamps = usersData.reduce((sum, u) => sum + (u.stamp_count || 0), 0);
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

  return (
    <div className="staff-dashboard">
      <h1>Staff Dashboard</h1>

      <div className="stats-grid">
        <div className="stat-card">
          <h2>{stats.totalRedemptions}</h2>
          <p>Total Redemptions</p>
        </div>
        <div className="stat-card">
          <h2>{stats.totalStamps}</h2>
          <p>Total Stamps</p>
        </div>
        <div className="stat-card">
          <h2>{stats.totalCustomers}</h2>
          <p>Total Customers</p>
        </div>
        <div className="stat-card">
          <h2>{stats.outstandingRewards}</h2>
          <p>Outstanding Rewards</p>
        </div>
      </div>

      {/* ✅ Staff-specific nav */}
      <StaffBottomNav />
    </div>
  );
}
