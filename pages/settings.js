// pages/settings.js
import { useState, useEffect } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import BottomNav from "../components/BottomNav";
import packageInfo from "../package.json";
import ConfirmDialog from "@/components/ConfirmDialog";
import jwt from "jsonwebtoken";
import * as cookie from "cookie";
import { supabase } from "../utils/supabaseClient";

function SettingsPage({ user }) {
  const [askDelete, setAskDelete] = useState(false);

  // ✅ Always initialise with a number
  const [stampCount, setStampCount] = useState(0);

  const router = useRouter();

  // fetch user's stamp count
  useEffect(() => {
    const fetchStampCount = async () => {
      const { data, error } = await supabase
        .from("users")
        .select("stamp_count")
        .eq("id", user.sub)
        .single();

      if (!error && data) {
        setStampCount(data.stamp_count || 0);
      } else {
        console.error("⚠️ Error fetching stamp count:", error?.message);
      }
    };

    fetchStampCount();
    const interval = setInterval(fetchStampCount, 5000);
    return () => clearInterval(interval);
  }, [user.sub]);


  const handleLogout = async () => {
    await fetch("/api/logout", { method: "POST" });
    router.push("/");
  };

  const doDeleteAccount = async () => {
    setAskDelete(false);
    await handleLogout();
  };

  return (
    <>
      <Head>
        <title>Settings</title>
      </Head>

      <header className="register-header-block">
        <h1 className="settings-title">
          Hi, <span>{user.username || "there"}</span>
        </h1>
      </header>

      <div className="sub-bar">How can we help?</div>

      <div className="settings-container">
        {/* profile */}
        <section>
          <h2 className="settings-section-title">Your Profile</h2>
          <div
            className="setting-option"
            onClick={() => router.push("/redeem-history")}
          >
            Redeem History
          </div>
        </section>

        {/* support */}
        <section>
          <h2 className="settings-section-title">Support and legal</h2>
          <div className="setting-option">Contact Us</div>
          <div className="setting-option">Terms & conditions</div>
          <div className="setting-option">Privacy Policy</div>
          <div className="setting-option" onClick={() => setAskDelete(true)}>
            Delete Account
          </div>
        </section>

        {/* version */}
        <section>
          <h2 className="settings-section-title">Version</h2>
          <p className="version-text">{packageInfo.version}</p>
        </section>

        <div className="logout-wrapper">
          <button className="logout-button" onClick={handleLogout}>
            Log Out
          </button>
        </div>
      </div>

      <ConfirmDialog
        open={askDelete}
        title="Delete account?"
        message="This cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={doDeleteAccount}
        onCancel={() => setAskDelete(false)}
      />

      {/* 👇 Always pass current stampCount to BottomNav */}
      <BottomNav stampCount={stampCount} />
    </>
  );
}

// ✅ Fetch stamp count server-side initially
export async function getServerSideProps({ req }) {
  const cookies = cookie.parse(req.headers.cookie || "");
  const token = cookies.token || null;

  if (!token) {
    return { redirect: { destination: "/", permanent: false } };
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const { data } = await supabase
      .from("users")
      .select("stamp_count")
      .eq("id", decoded.sub)
      .single();

    return {
      props: {
        user: decoded,
        initialStampCount: data?.stamp_count ?? 0,
      },
    };
  } catch (err) {
    return { redirect: { destination: "/", permanent: false } };
  }
}

export default SettingsPage;
