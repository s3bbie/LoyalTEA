import Head from 'next/head';
import '@/styles/globals.css';
import '@/styles/login.css';
import '@/styles/home.css';
import '@/styles/rewards.css';
import '@/styles/settings.css';
import BottomNav from '../components/BottomNav';
import { useRouter } from 'next/router';
import { Analytics } from '@vercel/analytics/react';

export default function App({ Component, pageProps }) {
  const router = useRouter();
  const hideNavOn = ['/', '/register', '/verify-email'];

  const showNav = !hideNavOn.includes(router.pathname);

  return (
    <>
      <Head>
        <link
          href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </Head>

      <Component {...pageProps} />
      {showNav && <BottomNav />}
      
      <Analytics />
    </>
  );
}
