// pages/staff/settings.js
import { useState } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import BottomNav from "@/components/BottomNav"; // ✅ use existing component
import packageInfo from "../../package.json";
import ConfirmDialog from "@/components/ConfirmDialog";
import jwt from "jsonwebtoken";
import * as cookie from "cookie";
import { supabase } from "../../utils/supabaseClient";

function StaffSettingsPage({ user }) {
  const [askDelete, setAskDelete] = useState(false);
  const router = useRouter();

  const handleLogout = async () => {
    await fetch("/api/logout", { method: "POST" });
    router.push("/staff/login");
  };

  const doDeleteAccount = async () => {
    setAskDelete(false);
    await handleLogout();
  };

  return (
    <>
      <Head>
        <title>Staff Settings</title>
      </Head>

      <header className="register-header-block">
        <h1 className="settings-title">
          Hi, <span>{user.username || "team member"}</span>
        </h1>
      </header>

      <div className="sub-bar">Staff options</div>

      <div className="settings-container">
        <section>
          <h2 className="settings-section-title">Tools</h2>
          <div className="setting-option" onClick={() => router.push("/staff/reports")}>
            Reports
          </div>
          <div className="setting-option" onClick={() => router.push("/staff/scan")}>
            Scan QR
          </div>
        </section>

        <section>
          <h2 className="settings-section-title">Support and legal</h2>
          <div className="setting-option">Contact Us</div>
          <div className="setting-option">Terms & conditions</div>
          <div className="setting-option">Privacy Policy</div>
          <div className="setting-option" onClick={() => setAskDelete(true)}>
            Delete Account
          </div>
        </section>

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
        title="Delete staff account?"
        message="This cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={doDeleteAccount}
        onCancel={() => setAskDelete(false)}
      />

      {/* ✅ Just use BottomNav with staff navItems */}
      <BottomNav />
    </>
  );
}

export async function getServerSideProps({ req }) {
  const cookies = cookie.parse(req.headers.cookie || "");
  const token = cookies.token || null;

  if (!token) {
    return { redirect: { destination: "/staff/login", permanent: false } };
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return { props: { user: decoded } };
  } catch (err) {
    return { redirect: { destination: "/staff/login", permanent: false } };
  }
}

export default StaffSettingsPage;
