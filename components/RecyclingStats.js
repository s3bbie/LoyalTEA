// components/RecyclingStats.js
import { useEffect, useState } from "react";
import { supabase } from "../utils/supabaseClient";

export default function RecyclingStats() {
  const [office, setOffice] = useState(0);
  const [dc, setDc] = useState(0);

  // fetch current stats
  const fetchStats = async () => {
    const { data, error } = await supabase
      .from("recycling_stats")
      .select("location, amount")
      .eq("year", 2025);

    if (error) {
      console.error("Error fetching recycling stats:", error.message);
      return;
    }

    const officeStat = data.find((d) => d.location === "office");
    const dcStat = data.find((d) => d.location === "dc");

    setOffice(officeStat?.amount || 0);
    setDc(dcStat?.amount || 0);
  };

  useEffect(() => {
    fetchStats();

    // subscribe to changes in recycling_stats
    const channel = supabase
      .channel("recycling-stats-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "recycling_stats" },
        (payload) => {
          console.log("Realtime change:", payload);
          fetchStats(); // refresh data whenever anything changes
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <div className="tabs-row">
      <div className="tab-card">
        <p>♻️ Office</p>
        <p className="tab-subtitle">{office} kg recycled</p>
      </div>
      <div className="tab-card">
        <p>🏭 DC</p>
        <p className="tab-subtitle">{dc} kg recycled</p>
      </div>
    </div>
  );
}
