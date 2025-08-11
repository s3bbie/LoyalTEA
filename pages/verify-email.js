import Head from "next/head";
import { useRouter } from "next/router";
import { EnvelopeIcon } from "@heroicons/react/24/outline";
import styles from "@/styles/verify-email.module.css";

export default function VerifyEmail() {
  const router = useRouter();

  return (
    <>
      <Head><title>Verify Your Email – LoyalTEA</title></Head>

      <div className={styles.screen}>
        <div className={styles.content}>
          <h1 className={styles.title}>Verify your Email</h1>
          <p className={styles.subtitle}>
            Check your email and tap the link to activate your account.
          </p>

          <EnvelopeIcon className={styles.illustration} />
        </div>

        <div className={styles.footer}>
          <button
            className={styles.primary}
            onClick={() => router.push("/")}
          >
            Continue
          </button>
        </div>
      </div>
    </>
  );
}
