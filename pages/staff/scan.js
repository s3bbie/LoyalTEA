import { useEffect, useRef, useState } from "react";
import { supabase } from "../../utils/supabaseClient";
import StaffBottomNav from "../../components/StaffBottomNav";
import QrScanner from "qr-scanner";

export default function StaffScan() {
  const videoRef = useRef(null);
  const [message, setMessage] = useState("Ready to scan...");

  useEffect(() => {
    if (!videoRef.current) return;

    const scanner = new QrScanner(
      videoRef.current,
      async (result) => {
        if (!result?.data) return;

        try {
          const parsed = JSON.parse(result.data);

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
      },
      {
        preferredCamera: "environment", // back camera on mobile
        highlightScanRegion: true,
        highlightCodeOutline: true,
      }
    );

    scanner.start().catch((err) => {
      console.error("Camera error:", err);
      setMessage("❌ Camera not found or blocked");
    });

    return () => {
      scanner.stop();
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-2xl font-bold mb-4">Scan Customer QR</h1>
      <p className="mb-4 text-gray-600">{message}</p>

      <div className="bg-white p-4 rounded-xl shadow flex flex-col items-center">
        <video ref={videoRef} className="w-full max-w-md rounded-lg" />
      </div>

      <StaffBottomNav />
    </div>
  );
}
