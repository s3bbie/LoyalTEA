import { useEffect, useRef, useState } from "react";
import StaffBottomNav from "../../components/StaffBottomNav";
import QrScanner from "qr-scanner";

export default function StaffScan() {
  const videoRef = useRef(null);
  const [message, setMessage] = useState("Please select cup type to start scanning...");
  const lockRef = useRef(false);
  const scannerRef = useRef(null);

  // ✅ Staff choice: null until selected
  const [reusable, setReusable] = useState(null);

  useEffect(() => {
    if (!videoRef.current || reusable === null) return; // wait until staff selects

    const scanner = new QrScanner(
  videoRef.current,
  async (result) => {
    if (!result?.data || lockRef.current) return;
    lockRef.current = true;

    // ✅ Capture staff choice at scan time
    const cupChoice = reusable;

    try {
      const parsed = JSON.parse(result.data);

      // ✅ Always send the locked-in choice
      const response = await fetch("/api/stamp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...parsed,
          reusable: cupChoice, // 🔒 ensures correct flag
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
  }, [reusable]); // 👈 re-run when staff changes choice

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-2xl font-bold mb-4">Scan Customer QR</h1>
      <p className="mb-4 text-gray-600">{message}</p>

      {/* ✅ Staff must pick one before scanning */}
      <div className="mb-4 flex items-center gap-6">
        <label className="flex items-center gap-2">
          <input
            type="radio"
            checked={reusable === false}
            onChange={() => {
              setReusable(false);
              setMessage("Disposable cup selected. Camera ready...");
            }}
          />
          Disposable Cup
        </label>
        <label className="flex items-center gap-2">
          <input
            type="radio"
            checked={reusable === true}
            onChange={() => {
              setReusable(true);
              setMessage("Reusable cup ♻️ selected. Camera ready...");
            }}
          />
          Reusable Cup ♻️
        </label>
      </div>

      {reusable !== null && (
        <div className="bg-white p-4 rounded-xl shadow flex flex-col items-center">
          <video ref={videoRef} className="w-full max-w-md rounded-lg" />
        </div>
      )}

      <StaffBottomNav />
    </div>
  );
}
