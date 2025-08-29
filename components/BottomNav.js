import Link from "next/link";
import { useRouter } from "next/router";

export default function BottomNav({ stampCount = 0 }) {
  const router = useRouter();

  const tabs = [
    { href: "/home", label: "Home", icon: "/images/home.svg" },
    { href: "/menu", label: "Menu", icon: "/images/menu.svg" },
    { href: "/rewards", label: "Rewards", icon: "/images/rewards.svg" },
    { href: "/settings", label: "Settings", icon: "/images/settings.svg" },
  ];

  return (
    <nav className="bottom-nav">
      {tabs.map((tab) => {
        const isActive = router.pathname === tab.href;

        // ✅ Show badge on Rewards tab whenever stampCount >= 9
        const showBadge =
          tab.label === "Rewards" && Number(stampCount ?? 0) >= 9;

        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`nav-item ${isActive ? "active" : ""}`}
          >
            <div className="icon-wrapper" style={{ position: "relative" }}>
              <img src={tab.icon} alt={tab.label} />
              {showBadge && <span className="badge">1</span>}
            </div>
            <span>{tab.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
