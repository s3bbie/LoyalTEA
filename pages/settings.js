import { useEffect, useState } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import { supabase } from "../utils/supabaseClient";
import BottomNav from "../components/BottomNav";
import withAuth from "../utils/withAuth";
import packageInfo from "../package.json";
import ConfirmDialog from "@/components/ConfirmDialog";
import HCaptcha from "@hcaptcha/react-hcaptcha";

function SettingsPage() {
  const [firstName, setFirstName] = useState("...");
  const [askReset, setAskReset] = useState(false);
  const [askDelete, setAskDelete] = useState(false);
  const [captchaToken, setCaptchaToken] = useState("");
  const router = useRouter();

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      const { data } = await supabase.auth.getUser();
      const userId = data?.user?.id;
      if (!userId) return;

      const key = `firstName:${userId}`;
      const cached = localStorage.getItem(key);
      if (cached && !cancelled) setFirstName(cached);

      const { data: profile, error } = await supabase
        .from("profiles")
        .select("first_name")
        .eq("id", userId)
        .single();

      if (!cancelled) {
        if (!error && profile?.first_name) {
          setFirstName(profile.first_name);
          localStorage.setItem(key, profile.first_name);
        } else {
          setFirstName("");
          localStorage.removeItem(key);
        }
      }
    };

    run();
    return () => {
      cancelled = true;
    };
  }, []);

  const clearUserCaches = async () => {
    const { data } = await supabase.auth.getUser();
    const userId = data?.user?.id;
    if (userId) localStorage.removeItem(`firstName:${userId}`);
  };

  const doResetPassword = async () => {
    setAskReset(false);

    if (!captchaToken) {
      alert("Please complete the captcha before continuing.");
      return;
    }

    const { data } = await supabase.auth.getUser();
    const email = data?.user?.email;
    if (!email) return alert("No email associated with this account.");

    const redirectTo =
      typeof window !== "undefined"
        ? `${window.location.origin}/update-password.html`
        : (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000") +
          "/update-password.html";

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo,
      captchaToken,
    });

    if (error) {
      alert(error.message || "Something went wrong. Please try again.");
    } else {
      alert("A password reset link has been sent to your email.");
      setCaptchaToken("");
    }
  };

  const doDeleteAccount = async () => {
    setAskDelete(false);
    await clearUserCaches();
    const { error } = await supabase.auth.signOut();
    if (!error) router.push("/");
  };

  return (
    <>
      <Head>
        <title>Settings</title>

      </Head>

      <header className="register-header-block">
        <h1 className="settings-title">Hi, <span>{firstName || "there"}</span></h1>
      </header>

      <div className="sub-bar">How can we help?</div>
      <div className="settings-container">
        <section>
          <h2 className="settings-section-title">Your Profile</h2>
          <div className="settings-link" onClick={() => setAskReset(true)}>Reset Password</div>
          <div className="setting-option" onClick={() => router.push("/redeem-history")}>Redeem History</div>
        </section>

        <section>
          <h2 className="settings-section-title">Support</h2>
          <div className="setting-option">Contact Us</div>
          <div className="setting-option" onClick={() => setAskDelete(true)}>Delete Account</div>
        </section>

        <section>
          <h2 className="settings-section-title">Version</h2>
          <p className="version-text">Web App Version: {packageInfo.version}</p>
        </section>

        <div className="logout-wrapper">
          <button
            className="logout-button"
            onClick={async () => {
              await clearUserCaches();
              const { error } = await supabase.auth.signOut();
              if (!error) router.push("/");
            }}
          >
            Log Out
          </button>
        </div>
      </div>

      {/* Confirm modals */}
      <ConfirmDialog
        open={askReset}
        title="Reset password?"
        message={
          <>
            We’ll email a secure link to reset your password.
            <div style={{ marginTop: "1rem" }}>
              <HCaptcha
                sitekey={process.env.NEXT_PUBLIC_HCAPTCHA_SITEKEY}
                onVerify={(token) => setCaptchaToken(token)}
              />
            </div>
          </>
        }
        confirmText="Send link"
        cancelText="Cancel"
        onConfirm={doResetPassword}
        onCancel={() => setAskReset(false)}
      />

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

export default withAuth(SettingsPage);
