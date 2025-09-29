// pages/staff/settings.js
import { useState } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import StaffBottomNav from "@/components/StaffBottomNav";
import packageInfo from "../../package.json";
import ConfirmDialog from "@/components/ConfirmDialog";
import { createPagesServerClient } from "@supabase/auth-helpers-nextjs";

function StaffSettingsPage({ user }) {
  const [askDelete, setAskDelete] = useState(false);
  const router = useRouter();

  const handleLogout = async () => {
    await fetch("/api/logout", { method: "POST" }); // optional custom cleanup
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
          Hi, <span>{user?.email || "team member"}</span>
        </h1>
      </header>

      <div className="sub-bar">Staff options</div>

      <div className="settings-container">
        <section>
          <h2 className="settings-section-title">Tools</h2>
          <div
            className="setting-option"
            onClick={() => router.push("/staff/reports")}
          >
            Reports
          </div>
          <div
            className="setting-option"
            onClick={() => router.push("/staff/scan")}
          >
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

      <StaffBottomNav />
    </>
  );
}

// ✅ Supabase Auth session check (no custom JWT needed)
export async function getServerSideProps(ctx) {
  const supabase = createPagesServerClient(ctx); // or createServerSupabaseClient if not yet updated
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    return { props: { initialUser: null } }; // don't hard redirect
  }

  return {
    props: {
      initialUser: session.user,
    },
  };
}


export default StaffSettingsPage;
