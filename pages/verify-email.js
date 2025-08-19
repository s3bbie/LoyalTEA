import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { EnvelopeIcon } from "@heroicons/react/24/outline";
import { supabase } from "@/utils/supabaseClient";
import styles from "@/styles/verify-email.module.css";

export default function VerifyEmail() {
  const router = useRouter();
  const [status, setStatus] = useState("waiting"); 
  const [message, setMessage] = useState("");
  const [emailInput, setEmailInput] = useState("");


  useEffect(() => {
    let mounted = true;

    (async () => {
      const { data: { session } } = await supabase.auth.getSession();

      
      if (!mounted) return;
      if (session?.user) {
        setStatus("verified");
        
        setTimeout(() => router.replace("/home"), 400);
        return;
      }

      
      const { data: userRes } = await supabase.auth.getUser();
      if (userRes?.user?.email) {
        setEmailInput(userRes.user.email);
      }
    })();

    
    const { data: sub } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        setStatus("verified");
        setTimeout(() => router.replace("/home"), 300);
      }
    });

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, [router]);

  async function handleResend() {
    setStatus("waiting");
    setMessage("");

    
    const { data: { session } } = await supabase.auth.getSession();
    const email = session?.user?.email || emailInput.trim();

    if (!email) {
      setStatus("error");
      setMessage("Please enter your email to resend the verification link.");
      return;
    }

    const { error } = await supabase.auth.resend({
      type: "signup",
      email,
    });

    if (error) {
      setStatus("error");
      setMessage(error.message || "Could not resend verification email.");
    } else {
      setStatus("resent");
      setMessage("Verification email sent. Please check your inbox.");
    }
  }

  return (
    <>
      <Head><title>Verify Your Email – LoyalTEA</title></Head>

      <div className={styles.screen}>
        <div className={styles.content}>
          <h1 className={styles.title}>
            {status === "verified" ? "You're all set!" : "Verify your Email"}
          </h1>

          {status === "verified" ? (
            <p className={styles.subtitle}>Redirecting you to your account…</p>
          ) : (
            <>
              <p className={styles.subtitle}>
                We’ve sent you a link to activate your account. Please check your inbox.
              </p>
              <EnvelopeIcon className={styles.illustration} />
            </>
          )}

          
          {status !== "verified" && (
            <div className={styles.resendBlock}>
              <input
                className={styles.input}
                type="email"
                placeholder="Your email address"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                autoComplete="email"
              />
              <button className={styles.secondary} onClick={handleResend}>
                Resend verification email
              </button>
            </div>
          )}

          {!!message && (
            <p className={status === "error" ? styles.error : styles.info}>
              {message}
            </p>
          )}
        </div>

        <div className={styles.footer}>
          <button
            className={styles.primary}
            onClick={() => router.push("/")}
          >
            Back to sign in
          </button>
        </div>
      </div>
    </>
  );
}
