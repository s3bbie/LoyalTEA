import { useEffect, useRef, useState } from "react";
import { supabase } from "../../utils/supabaseClient";
import StaffBottomNav from "../../components/StaffBottomNav";
import QrScanner from "qr-scanner";

export default function StaffScan() {
  const videoRef = useRef(null);
  const [message, setMessage] = useState("Ready to scan...");
  const [scannedData, setScannedData] = useState(null);

  useEffect(() => {
    let qrScanner;

    if (videoRef.current) {
      qrScanner = new QrScanner(
        videoRef.current,
        async (result) => {
          if (!result?.data) return;
          handleScan(result.data);
        },
        {
          highlightScanRegion: true,
          highlightCodeOutline: true,
        }
      );

      qrScanner.start().catch((err) => {
        console.error("Camera error:", err);
        setMessage("❌ Camera error");
      });
    }

    return () => {
      if (qrScanner) {
        qrScanner.stop();
        qrScanner.destroy();
      }
    };
  }, []);

  async function handleScan(data) {
    try {
      const parsed = JSON.parse(data);
      setScannedData(parsed);

      if (parsed.mode === "stamp") {
        const { error } = await supabase
          .from("users")
          .update({
            stamp_count: supabase.rpc("increment", { by: 1 }),
            total_stamps: supabase.rpc("increment", { by: 1 }),
          })
          .eq("id", parsed.userId);

        if (error) throw error;
        setMessage(`✅ Stamp added for ${parsed.userId}`);
      }

      if (parsed.mode === "reward") {
        const { error: updateError } = await supabase
          .from("users")
          .update({
            stamp_count: supabase.rpc("decrement", { by: 9 }),
          })
          .eq("id", parsed.userId);

        if (updateError) throw updateError;

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

  return (
    <div className="scan-page">
      <h1>Scan Customer QR</h1>
      <p>{message}</p>

      <div className="qr-reader">
        <video ref={videoRef} style={{ width: "100%" }} />
      </div>

      <StaffBottomNav />
    </div>
  );
}
