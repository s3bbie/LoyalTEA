import { useState } from "react";
import dynamic from "next/dynamic";
import { supabase } from "../../utils/supabaseClient";
import StaffBottomNav from "../../components/StaffBottomNav";

// dynamically load QR reader (no SSR issues)
const QrReader = dynamic(() => import("react-qr-reader"), { ssr: false });

export default function StaffScan() {
  const [message, setMessage] = useState("Ready to scan...");
  const [scannedData, setScannedData] = useState(null);

  async function handleScan(data) {
    if (!data) return;

    try {
      const parsed = JSON.parse(data);
      setScannedData(parsed);

      if (parsed.mode === "stamp") {
        // ✅ increment stamps
        const { error } = await supabase
          .from("users")
          .update({
            stamp_count: supabase.rpc("increment", { by: 1 }), // or just stamp_count + 1 if RPC not set
            total_stamps: supabase.rpc("increment", { by: 1 }),
          })
          .eq("id", parsed.userId);

        if (error) throw error;
        setMessage(`✅ Stamp added for ${parsed.userId}`);
      }

      if (parsed.mode === "reward") {
        // ✅ subtract 9 stamps and log redemption
        const { error: updateError } = await supabase
          .from("users")
          .update({
            stamp_count: supabase.rpc("decrement", { by: 9 }),
          })
          .eq("id", parsed.userId);

        if (updateError) throw updateError;

        // log redemption
        const { error: logError } = await supabase.from("redemptions").insert([
          {
            user_id: parsed.userId,
            reward: parsed.reward,
            redeemed_at: new Date().toISOString(),
          },
        ]);

        if (logError) throw logError;

        setMessage(`🎉 Redeemed ${parsed.reward} for ${parsed.userId}`);
      }
    } catch (err) {
      console.error("Scan error:", err);
      setMessage("❌ Invalid QR or database error");
    }
  }

  function handleError(err) {
    console.error(err);
    setMessage("❌ Camera error");
  }

  return (
    <div className="scan-page">
      <h1>Scan Customer QR</h1>
      <p>{message}</p>

      <div className="qr-reader">
        <QrReader
          delay={300}
          onError={handleError}
          onScan={handleScan}
          style={{ width: "100%" }}
        />
      </div>

      <StaffBottomNav />
    </div>
  );
}
