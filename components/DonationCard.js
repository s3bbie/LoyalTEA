import { useEffect, useState } from "react";
import { supabase } from "../utils/supabaseClient";

export default function DonationCard() {
  const [totalDonations, setTotalDonations] = useState(0);

  useEffect(() => {
    async function fetchTotal() {
      const { data, error } = await supabase
        .from("donation_totals")
        .select("total_amount")
        .eq("id", 1)
        .single();

      if (!error && data) {
        setTotalDonations(data.total_amount);
      }
    }
    fetchTotal();
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
