import { useEffect, useRef, useState } from "react";
import StaffBottomNav from "../../components/StaffBottomNav";
import QrScanner from "qr-scanner";

export default function StaffScan() {
  const videoRef = useRef(null);
  const [message, setMessage] = useState("Select a cup type to start scanning...");
  const [activeMode, setActiveMode] = useState(null); // null | "reusable" | "disposable"
  const lockRef = useRef(false);
  const scannerRef = useRef(null);

  useEffect(() => {
    if (!videoRef.current || !activeMode) return;

    const scanner = new QrScanner(
      videoRef.current,
      async (result) => {
        if (!result?.data || lockRef.current) return;
        lockRef.current = true;

        try {
          const parsed = JSON.parse(result.data);

          const response = await fetch("/api/stamp", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              ...parsed,
              reusable: activeMode === "reusable", // pass choice
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
          // After scan → close camera and go back to choice screen
          setTimeout(() => {
            setActiveMode(null);
            lockRef.current = false;
            setMessage("Select a cup type to start scanning...");
          }, 2000);
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
  }, [activeMode]);

  return (
    <div className="min-h-screen bg-gray-100 p-6 flex flex-col items-center">
      <h1 className="text-2xl font-bold mb-4">Scan Customer QR</h1>
      <p className="mb-4 text-gray-600">{message}</p>

      {/* If no mode chosen → show big buttons */}
      {!activeMode && (
        <div className="flex flex-col gap-6 w-full max-w-sm">
          <button
            className="w-full py-6 bg-green-600 text-white text-xl font-bold rounded-xl shadow-lg"
            onClick={() => {
              setActiveMode("reusable");
              setMessage("Reusable cup ♻️ selected. Camera ready...");
            }}
          >
            ♻️ Reusable Cup
          </button>
          <button
            className="w-full py-6 bg-red-600 text-white text-xl font-bold rounded-xl shadow-lg"
            onClick={() => {
              setActiveMode("disposable");
              setMessage("Disposable cup selected. Camera ready...");
            }}
          >
            🗑️ Disposable Cup
          </button>
        </div>
      )}

      {/* If mode chosen → show camera */}
      {activeMode && (
        <div className="bg-white p-4 rounded-xl shadow flex flex-col items-center w-full max-w-md">
          <video ref={videoRef} className="w-full rounded-lg" />
          <button
            className="mt-4 px-4 py-2 bg-gray-200 rounded-lg"
            onClick={() => {
              setActiveMode(null);
              setMessage("Select a cup type to start scanning...");
            }}
          >
            Cancel
          </button>
        </div>
      )}

      <StaffBottomNav />
    </div>
  );
}
