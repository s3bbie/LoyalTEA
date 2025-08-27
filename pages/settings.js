import { useState } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import BottomNav from "../components/BottomNav";
import packageInfo from "../package.json";
import ConfirmDialog from "@/components/ConfirmDialog";
import jwt from "jsonwebtoken";
import * as cookie from "cookie";

function SettingsPage({ user }) {
  const [askDelete, setAskDelete] = useState(false);
  const router = useRouter();

  const handleLogout = async () => {
    await fetch("/api/logout", { method: "POST" });
    router.push("/");
  };

  const doDeleteAccount = async () => {
    setAskDelete(false);

    // you can add a DELETE call to your own API endpoint here
    // e.g. await fetch("/api/delete-account", { method: "POST" })

    await handleLogout();
  };

  return (
    <>
      <Head><title>Settings</title></Head>

      <header className="register-header-block">
        <h1 className="settings-title">Hi, <span>{user.username || "there"}</span></h1>
      </header>

      <div className="sub-bar">How can we help?</div>
      <div className="settings-container">
        <section>
          <h2 className="settings-section-title">Your Profile</h2>
          {/* You could add profile editing here later */}
          <div className="setting-option" onClick={() => router.push("/redeem-history")}>
            Redeem History
          </div>
        </section>

        <section>
          <h2 className="settings-section-title">Support and legal</h2>
          <div className="setting-option">Contact Us</div>
          <div className="setting-option">Terms & conditions</div>
          <div className="setting-option">Privacy Policy</div>
          <div className="setting-option" onClick={() => setAskDelete(true)}>Delete Account</div>
        </section>

        <section>
          <h2 className="settings-section-title">Version</h2>
          <p className="version-text"> {packageInfo.version}</p>
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

      <BottomNav />
    </>
  );
}

// ✅ Protect the page & get user info from JWT in cookies
export async function getServerSideProps({ req }) {
  const cookies = cookie.parse(req.headers.cookie || "");
  const token = cookies.token || null;

  if (!token) {
    return { redirect: { destination: "/", permanent: false } };
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return { props: { user: decoded } };
  } catch (err) {
    return { redirect: { destination: "/", permanent: false } };
  }
}

export default SettingsPage;
