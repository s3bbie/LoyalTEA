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
        const showBadge = tab.label.toLowerCase() === "rewards" && Number(stampCount) >= 9;

        console.log("Tab:", tab.label, "stampCount:", stampCount, "=> showBadge:", showBadge);

        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`nav-item ${isActive ? "active" : ""}`}
          >
            <div className="icon-wrapper">
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
