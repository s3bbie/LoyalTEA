import { useEffect, useRef, useState } from "react";
import StaffBottomNav from "../../components/StaffBottomNav";
import QrScanner from "qr-scanner";

export default function StaffScan() {
  const videoRef = useRef(null);
  const [message, setMessage] = useState("Ready to scan...");
  const lockRef = useRef(false);
  const scannerRef = useRef(null);

  // ✅ Staff choice
  const [reusable, setReusable] = useState(false);

  useEffect(() => {
    if (!videoRef.current) return;

    const scanner = new QrScanner(
      videoRef.current,
      async (result) => {
        if (!result?.data || lockRef.current) return;
        lockRef.current = true;

        try {
          const parsed = JSON.parse(result.data);

          // ✅ Send QR data + staff choice
          const response = await fetch("/api/stamp", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              ...parsed,
              reusable, // add reusable flag
            }),
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
          scanner.stop();
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
  }, []); // 👈 run only once

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-2xl font-bold mb-4">Scan Customer QR</h1>
      <p className="mb-4 text-gray-600">{message}</p>

      {/* ✅ Staff toggle */}
      <div className="mb-4 flex items-center gap-6">
        <label className="flex items-center gap-2">
          <input
            type="radio"
            checked={!reusable}
            onChange={() => setReusable(false)}
          />
          Disposable Cup
        </label>
        <label className="flex items-center gap-2">
          <input
            type="radio"
            checked={reusable}
            onChange={() => setReusable(true)}
          />
          Reusable Cup ♻️
        </label>
      </div>

      <div className="bg-white p-4 rounded-xl shadow flex flex-col items-center">
        <video ref={videoRef} className="w-full max-w-md rounded-lg" />
      </div>

      <StaffBottomNav />
    </div>
  );
}
