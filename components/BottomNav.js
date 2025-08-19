import Link from "next/link";
import { useRouter } from "next/router";

export default function BottomNav() {
  const router = useRouter();

  const tabs = [
    { href: "/home", label: "Home", icon: "/images/home.svg" },
    { href: "/menu", label: "Menu", icon: "/images/menu.svg" },
    { href: "/rewards", label: "Rewards", icon: "/images/rewards.svg" },
    { href: "/settings", label: "Settings", icon: "/images/settings.svg" },
  ];

  return (
    <nav className="bottom-nav">
      {tabs.map((tab) => (
        <Link key={tab.href} href={tab.href} legacyBehavior>
          <a className={`nav-item ${router.pathname === tab.href ? "active" : ""}`}>
            <img src={tab.icon} alt={tab.label} />
            <span>{tab.label}</span>
          </a>
        </Link>
      ))}
    </nav>
  );
}
