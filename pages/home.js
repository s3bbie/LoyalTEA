import { useEffect, useState } from "react";
import Head from "next/head";
import { supabase } from "../utils/supabaseClient";
import BottomNav from "../components/BottomNav";
import withAuth from "../utils/withAuth";
import QrScanner from "qr-scanner";

let scannerInstance = null;
let scanHandled = false;

function Home() {
  const [userName, setUserName] = useState("");
  const [stampCount, setStampCount] = useState(0);
  const [userId, setUserId] = useState(null);
  const [showQRModal, setShowQRModal] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      setUserId(user.id);

      const { data, error } = await supabase
        .from("profiles")
        .select("first_name, stamp_count")
        .eq("id", user.id)
        .single();

      if (!error && data) {
        setUserName(data.first_name || "Friend");
        setStampCount(data.stamp_count || 0);
      }
    };

    fetchUserData();
  }, []);

  const loadStampCount = async () => {
    if (!userId) return;

    const { data, error } = await supabase
      .from("profiles")
      .select("stamp_count")
      .eq("id", userId)
      .single();

    if (error) {
      console.error("Error loading profile stamp count:", error.message);
    } else {
      setStampCount(data.stamp_count || 0);
    }
  };

  const generateTodayHash = async () => {
    const today = new Date().toISOString().slice(0, 10);
    const encoder = new TextEncoder();
    const hashBuffer = await crypto.subtle.digest(
      "SHA-256",
      encoder.encode("LOYALTEA_SECRET_SALT" + today)
    );
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
  };

  const handleShowQRCode = async () => {
    if (!userId) {
      alert("User ID not ready yet.");
      return;
    }

    setShowQRModal(true);
    scanHandled = false;

    const todayHash = await generateTodayHash();
    const videoElem = document.getElementById("qr-reader");

    scannerInstance = new QrScanner(
      videoElem,
      async (result) => {
        if (scanHandled) return;

        let data;
        try {
          data = JSON.parse(result.data);
        } catch {
          alert("Invalid QR code.");
          return;
        }

        if (data.type === "staff" && data.code === todayHash) {
          scanHandled = true;
          await addStamp();
          alert("Stamp added!");
          scannerInstance.stop();
          setShowQRModal(false);
        } else {
          alert("Invalid staff QR.");
        }
      },
      {
        preferredCamera: "environment",
        highlightScanRegion: true,
        highlightCodeOutline: true,
      }
    );

    scannerInstance.start();
  };

const addStamp = async () => {
  if (stampCount >= 9) {
    alert("You already have 9 stamps. Please redeem your free drink before collecting more.");
    return;
  }

  const newCount = stampCount + 1;

  const { error: profileError } = await supabase
    .from("profiles")
    .update({ stamp_count: newCount })
    .eq("id", userId);

  if (profileError) {
    console.error("Error updating profile stamp count:", profileError.message);
    return;
  }

  const { error: insertError } = await supabase
    .from("stamps")
    .insert({
      user_id: userId,
      method: "QR",
      scanned_by: userId, 
    });

  if (insertError) {
    console.error("Error inserting stamp:", insertError.message);
    return;
  }

  setStampCount(newCount);
};


  return (
    <>
      <Head>
        <title>Home – LoyalTEA</title>
      </Head>

      <div id="pageWrapper">
        <div className="home-container">
          <div className="top-background-block"></div>

          <div className="home-header">
            <p className="welcome-text">
              Hi,<span className="user-name"> {userName}</span>
            </p>
          </div>

          <h2 className="beans-title-outside">Total Stamps</h2>
<div className="action-section">

          <section className="beans-card">
            <div className="beans-visual">
              <div className="beans-count">
                <span>{stampCount}</span>/<span>9</span>
              </div>
              <div className="stamp-grid" id="stampGrid">
                {[...Array(9)].map((_, i) => (
                  <div
                    key={i}
                    className={`stamp ${i < stampCount ? "filled" : ""}`}
                  ></div>
                ))}
              </div>
            </div>
          </section>

          </div>

<div className="action-section">
  <button className="use-btn" onClick={handleShowQRCode}>
    <div className="button-text-container">
      <span className="collect-stamps-text">Collect Stamps</span>
      <span className="scan-at-till-text">Scan at till</span>
    </div>
  </button>
</div>


          

          <div className="action-section">
            <button className="menu-btn" id="menuBtn">
              Canteen Menu
            </button>
          </div>
        </div>

        {showQRModal && (
          <div className="qr-modal">
            <div className="qr-modal-content">
              <p className="qr-modal-header">Scan Staff QR</p>
              <video id="qr-reader" playsInline></video>
              <button
                className="close-btn"
                onClick={() => {
                  if (scannerInstance) scannerInstance.stop();
                  setShowQRModal(false);
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        <BottomNav />
      </div>
    </>
  );
}

export default withAuth(Home);
