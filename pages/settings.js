// pages/settings.js
import { useState, useEffect } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import BottomNav from "../components/BottomNav";
import packageInfo from "../package.json";
import ConfirmDialog from "@/components/ConfirmDialog";
import { supabase } from "../utils/authClient";
import { useSessionContext } from "@supabase/auth-helpers-react";

export default function SettingsPage() {
  const { session, isLoading } = useSessionContext();
  const router = useRouter();

  const user = session?.user || null;
  const [askDelete, setAskDelete] = useState(false);
  const [stampCount, setStampCount] = useState(0);

  // 🚦 redirect only if not loading and no user
  useEffect(() => {
    if (!isLoading && !user) {
      router.replace("/");
    }
  }, [isLoading, user, router]);

  // fetch user's stamp count live
  useEffect(() => {
    if (!user) return;

    const fetchStampCount = async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("stamp_count")
        .eq("id", user.id)
        .maybeSingle();

      if (!error && data) {
        setStampCount(data.stamp_count || 0);
      } else {
        console.error("⚠️ Error fetching stamp count:", error?.message);
      }
    };

    fetchStampCount();
    const interval = setInterval(fetchStampCount, 5000);
    return () => clearInterval(interval);
  }, [user]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  const doDeleteAccount = async () => {
    setAskDelete(false);
    await handleLogout();
  };

  if (isLoading) {
    return <p>Checking session...</p>;
  }

  if (!user) {
    return null; // router will redirect
  }

  return (
    <>
      <Head>
        <title>Settings</title>
      </Head>

      <header className="register-header-block">
        <h1 className="settings-title">
          Hi, <span>{user.email?.split("@")[0] || "there"}</span>
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

      <BottomNav stampCount={stampCount} />
    </>
  );
}
