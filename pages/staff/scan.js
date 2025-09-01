import { useEffect, useRef, useState } from "react";
import { supabase } from "../../utils/supabaseClient";
import StaffBottomNav from "../../components/StaffBottomNav";
import QrScanner from "qr-scanner";

export default function StaffScan() {
  const videoRef = useRef(null);
  const [message, setMessage] = useState("Ready to scan...");
  const lockRef = useRef(false); // lock to prevent double scan
  const scannerRef = useRef(null);

  useEffect(() => {
    if (!videoRef.current) return;

    const scanner = new QrScanner(
      videoRef.current,
      async (result) => {
        if (!result?.data || lockRef.current) return;
        lockRef.current = true; // immediate lock

        try {
          const parsed = JSON.parse(result.data);

          // ✅ STAMP MODE
          if (parsed.mode === "stamp") {
            const { data: userData, error: fetchError } = await supabase
              .from("users")
              .select("stamp_count, username")
              .eq("id", parsed.userId)
              .single();

            if (fetchError || !userData) throw fetchError || new Error("User not found");

            if ((userData.stamp_count || 0) >= 9) {
              setMessage(`⚠️ ${userData.username} already has 9 stamps. Must redeem before collecting more.`);
              return;
            }

            const newCount = (userData.stamp_count || 0) + 1;

            // Update user's live balance
            const { error: updateError } = await supabase
              .from("users")
              .update({ stamp_count: newCount })
              .eq("id", parsed.userId);

            if (updateError) throw updateError;

            // Log into stamps history table
            const { error: logError } = await supabase.from("stamps").insert([
              {
                user_id: parsed.userId,
                created_at: new Date().toISOString(),
              },
            ]);

            if (logError) throw logError;

            setMessage(`✅ Added 1 stamp for ${userData.username} (${newCount}/9)`);
          }

          // ✅ REWARD MODE
          if (parsed.mode === "reward") {
            const { data: userData, error: fetchError } = await supabase
              .from("users")
              .select("stamp_count, username")
              .eq("id", parsed.userId)
              .single();

            if (fetchError || !userData) throw fetchError || new Error("User not found");

            if (userData.stamp_count < 9) {
              setMessage(`⚠️ ${userData.username} does not have enough stamps to redeem a reward`);
              return;
            }

            // Deduct stamps from balance
            const { error: updateError } = await supabase
              .from("users")
              .update({
                stamp_count: userData.stamp_count - 9,
              })
              .eq("id", parsed.userId);

            if (updateError) throw updateError;

            // Log redemption in history
            const { error: logError } = await supabase.from("redeems").insert([
              {
                user_id: parsed.userId,
                reward: parsed.reward,
                redeemed_at: new Date().toISOString(),
              },
            ]);

            if (logError) throw logError;

            setMessage(`🎉 ${userData.username} redeemed ${parsed.reward}`);
          }
        } catch (err) {
          console.error("Scan error:", err);
          setMessage("❌ Invalid QR or database error");
        } finally {
          scanner.stop();

          // Auto restart after 3s
          setTimeout(() => {
            lockRef.current = false;
            setMessage("Ready to scan...");
            scanner.start().catch((err) => {
              console.error("Camera restart error:", err);
              setMessage("❌ Unable to restart camera");
            });
          }, 3000);
        }
      },
      {
        preferredCamera: "environment",
        highlightScanRegion: true,
        highlightCodeOutline: true,
      }
    );

    scanner.start().catch((err) => {
      console.error("Camera error:", err);
      setMessage("❌ Camera not found or blocked");
    });

    scannerRef.current = scanner;

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
