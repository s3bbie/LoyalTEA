import { useEffect, useRef, useState } from "react";
import StaffBottomNav from "../../components/StaffBottomNav";
import QrScanner from "qr-scanner";

export default function StaffScan() {
  const videoRef = useRef(null);
  const [message, setMessage] = useState("Ready to scan...");
  const lockRef = useRef(false);
  const scannerRef = useRef(null);

  useEffect(() => {
    if (!videoRef.current) return;

    const scanner = new QrScanner(
      videoRef.current,
      async (result) => {
        if (!result?.data || lockRef.current) return;
        lockRef.current = true; // prevent double scans

        try {
          const parsed = JSON.parse(result.data);

          // 🔑 Send QR data to API route
          const response = await fetch("/api/stamp", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(parsed), // parsed = { mode, userId, reward? }
          });

          const apiResult = await response.json();

          if (response.ok) {
            setMessage(apiResult.message);
          } else {
            setMessage(`❌ ${apiResult.error}`);
          }
        } catch (err) {
          console.error("Scan error:", err);
          setMessage("❌ Invalid QR or database error");
        } finally {
          // Stop scanner after one read
          scanner.stop();

          // Auto-restart after 3s
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
