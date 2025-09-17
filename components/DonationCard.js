import { useEffect, useState } from "react";
import { supabase } from "../utils/supabaseClient";

export default function DonationCard() {
  const [totalDonations, setTotalDonations] = useState(0);

  const fetchTotal = async () => {
    const { data, error } = await supabase
      .from("donation_totals")
      .select("total_amount")
      .eq("id", 1)
      .single();

    if (!error && data) {
      setTotalDonations(data.total_amount);
    }
  };

  useEffect(() => {
    fetchTotal();

    // ✅ Realtime subscription
    const channel = supabase
      .channel("donation-totals-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "donation_totals" },
        (payload) => {
          console.log("Donation total updated:", payload);
          fetchTotal(); // refresh the total when data changes
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <div className="action-section">
      <button className="charity-btn">
        <span className="charity-title">Together we’ve raised</span>
        <span className="charity-amount">
          £
          {totalDonations
            ? totalDonations.toLocaleString("en-GB", {
                minimumFractionDigits: 0,
              })
            : "0"}
        </span>
        <span className="charity-sub">
          Donated in {new Date().getFullYear()}
        </span>
      </button>
    </div>
  );
}
