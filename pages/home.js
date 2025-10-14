import { useEffect, useState } from "react";
import Head from "next/head";
import BottomNav from "../components/BottomNav";
import { supabase } from "../utils/authClient";
import { QRCodeCanvas } from "qrcode.react";
import DonationCard from "../components/DonationCard";
import RecyclingStats from "../components/RecyclingStats";
import Co2Equivalents from "../components/Co2Equivalents";
import { createServerSupabaseClient } from "@supabase/auth-helpers-nextjs";
import { useSessionContext } from "@supabase/auth-helpers-react";
import { useRouter } from "next/router";

function IntroModal({ onClose }) {
  const handleClose = () => {
    localStorage.setItem("introSeen", "true");
    onClose();
  };

  return (
    <div className="modal">
      <div className="modal-content">
        <span className="close" onClick={handleClose}>
          ×
        </span>
        <h2>Welcome to LoyalTEA ☕</h2>
        <p>
          Collect stamps every time you buy at the canteen. Once you reach 9,
          redeem a free drink 🎉
        </p>
        <button className="btn-primary" onClick={handleClose}>
          Got it!
        </button>
      </div>
    </div>
  );
}

function Home({ initialUser }) {
  const { session, isLoading } = useSessionContext();
  const router = useRouter();
  const user = session?.user || initialUser;

  const [stampCount, setStampCount] = useState(0);
  const [stamps, setStamps] = useState([]);
  const [dbUserId, setDbUserId] = useState(user?.id || null);
  const [showQR, setShowQR] = useState(false);
  const [showIntro, setShowIntro] = useState(false);
  const [totalCo2, setTotalCo2] = useState(0);
  const [widgets, setWidgets] = useState([]);
  const [announcements, setAnnouncements] = useState([]);

  // 🚦 Redirect if not logged in
  useEffect(() => {
    if (!isLoading && !user) router.replace("/");
  }, [isLoading, user, router]);

  // 🧩 Fetch widgets & announcements
  useEffect(() => {
    async function loadWidgets() {
      const { data, error } = await supabase
        .from("user_widgets")
        .select("*")
        .eq("is_active", true)
        .order("sort_order", { ascending: true });

      if (error) {
        console.error(error);
        return;
      }

      if (data) {
        const now = new Date();
        const recentAnnouncements = data.filter(
          (w) =>
            w.type === "announcement" &&
            w.created_at &&
            new Date(w.created_at).getTime() >
              now.getTime() - 24 * 60 * 60 * 1000
        );
        setAnnouncements(recentAnnouncements);
        setWidgets(data);
      }
    }

    loadWidgets();
  }, []);

  // 🪄 Extract banners/info/button widgets early (safe)
  const banners = (widgets || []).filter((w) => w.slot === "banner");
  const info = widgets.find((w) => w.slot === "info");
  const button = widgets.find((w) => w.slot === "button");

  // 🎠 Auto-scroll banners every 4s
  useEffect(() => {
    const container = document.getElementById("bannersCarousel");
    if (!container) return;

    let index = 0;
    let paused = false;
    let pauseTimeout;

    const slides = container.querySelectorAll(".banner-slide");
    if (!slides.length) return;

    const handleUserScroll = () => {
      paused = true;
      clearTimeout(pauseTimeout);
      pauseTimeout = setTimeout(() => (paused = false), 5000); // resume after 5s idle
    };

    container.addEventListener("scroll", handleUserScroll);

    const interval = setInterval(() => {
      if (paused || !slides.length) return;
      index = (index + 1) % slides.length;
      slides[index].scrollIntoView({ behavior: "smooth", inline: "center" });
    }, 4000);

    return () => {
      clearInterval(interval);
      container.removeEventListener("scroll", handleUserScroll);
    };
  }, [banners]);

  // 🔄 Fetch user data & stamps
  useEffect(() => {
    if (!user) return;

    if (!localStorage.getItem("introSeen")) setShowIntro(true);

    const fetchData = async () => {
      const { data: profileData } = await supabase
        .from("profiles")
        .select("stamp_count, total_co2_saved")
        .eq("id", user.id)
        .maybeSingle();

      if (profileData) {
        setStampCount(profileData.stamp_count || 0);
        setTotalCo2(profileData.total_co2_saved ?? 0);
      }

      const { data: stampsData } = await supabase
        .from("stamps")
        .select("id, user_id, reusable, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: true });

      if (stampsData) {
        setStamps(stampsData.slice(-9).reverse());
      }
    };

    fetchData();

    const channel = supabase
      .channel("home-live")
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "profiles",
          filter: `id=eq.${user.id}`,
        },
        (payload) => {
          setStampCount(payload.new.stamp_count);
          setTotalCo2(payload.new.total_co2_saved ?? 0);
        }
      )
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "stamps",
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          setStamps((prev) =>
            [...prev, payload.new]
              .sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
              .slice(-9)
          );
        }
      )
      .subscribe();

    const handleOptimisticStamp = (e) => {
      if (e.detail.userId !== user.id) return;
      const { stamp, stampCount, totalCo2, reusable } = e.detail;
      const optimisticStamp = stamp || {
        id: `optimistic-${Date.now()}`,
        user_id: user.id,
        reusable,
        created_at: new Date().toISOString(),
      };
      setStamps((prev) =>
        [...prev, optimisticStamp]
          .sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
          .slice(-9)
      );
      setStampCount(stampCount);
      setTotalCo2(totalCo2 ?? 0);
    };

    window.addEventListener("stamp-added", handleOptimisticStamp);
    return () => {
      window.removeEventListener("stamp-added", handleOptimisticStamp);
      supabase.removeChannel(channel);
    };
  }, [user]);

  if (isLoading) return <p>Checking session...</p>;
  if (!user) return null;

  return (
    <>
      <Head>
        <title>Home – LoyalTEA</title>
      </Head>

      <div id="pageWrapper">
        {/* 📰 Announcement Bar */}
        {announcements.length > 0 && (
          <div className="announcement-bar">
            {announcements.map((a) => (
              <div key={a.id} className="announcement-slide">
                {a.content}
              </div>
            ))}
          </div>
        )}

        <div className="home-container">
          <div className="top-background-block"></div>

          {/* 👋 Welcome header */}
          <div className="home-header">
            <p className="welcome-text">
              Hi,<span className="user-name"> {user.email?.split("@")[0]}</span>
            </p>
          </div>

          {/* 🫘 Stamps */}
          <h2 className="beans-title-outside">Total Stamps</h2>
          <div className="action-section">
            <section className="beans-card">
              <div className="beans-visual">
                <div className="beans-count">
                  <span>{stampCount}</span>/<span>9</span>
                </div>
                <div className="stamp-grid" id="stampGrid">
                  {[...Array(9)].map((_, i) => {
                    const stamp = stamps[i];
                    if (stamp) {
                      const reusable =
                        stamp.reusable === true || stamp.reusable === "true";
                      return (
                        <div
                          key={stamp.id || i}
                          className={`stamp ${
                            reusable ? "reusable" : "non-reusable"
                          }`}
                        />
                      );
                    }
                    return <div key={i} className="stamp" />;
                  })}
                </div>
              </div>
              <div className="co2-saved-text mt-3 text-center">
                <Co2Equivalents co2Saved={totalCo2} />
              </div>
            </section>
          </div>

          {/* 📱 QR Code Section */}
          <div className={`qr-box ${showQR ? "open" : ""}`}>
            <button className="use-btn" onClick={() => setShowQR(!showQR)}>
              <div className="button-text-container">
                <span className="collect-stamps-text">Select here to</span>
                <span className="scan-at-till-text">Show QR Code</span>
              </div>
            </button>

            {dbUserId && (
              <div className="qr-content">
                <button
                  className="qr-close-inline"
                  onClick={() => setShowQR(false)}
                />
                <div className="qr-display">
                  <QRCodeCanvas
                    value={JSON.stringify({ mode: "stamp", userId: dbUserId })}
                    size={160}
                  />
                  <p>
                    Show this QR Code to staff to <br />
                    collect your stamp
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* 🌼 Marie Curie banner & ♻️ Recycling stats */}
          <section className="donation-and-recycling">
            <DonationCard />
            <RecyclingStats />
          </section>

          {/* 🆕 Banners Carousel (below Marie Curie) */}
          {banners?.length > 0 && (
            <div className="banners-carousel" id="bannersCarousel">
              <div className="banners-track">
                {banners.map((b) => (
                  <div
                    key={b.id}
                    className="banner-slide"
                    style={{ backgroundImage: `url(${b.image_url})` }}
                  />
                ))}
              </div>
            </div>
          )}

          {/* 💬 Info Box */}
          {info?.content && <div className="info-box">{info.content}</div>}

          {/* 🔘 Button Widget */}
          {button?.title && button?.link && (
            <button
              className="user-cta-btn"
              onClick={() => (window.location.href = button.link)}
            >
              {button.title}
            </button>
          )}
        </div>

        {showIntro && <IntroModal onClose={() => setShowIntro(false)} />}
        <BottomNav stampCount={stamps.length} />
      </div>
    </>
  );
}

// ✅ SSR
export async function getServerSideProps(ctx) {
  const supabase = createServerSupabaseClient(ctx);
  const {
    data: { session },
  } = await supabase.auth.getSession();

  return {
    props: {
      initialUser: session ? session.user : null,
    },
  };
}

export default Home;
