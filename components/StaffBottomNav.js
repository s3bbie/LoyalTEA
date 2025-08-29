import Link from "next/link";
import { useRouter } from "next/router";

export default function StaffBottomNav() {
  const router = useRouter();

  const navItems = [
    { href: "/staff/dashboard", label: "Home", icon: "/images/home.svg" },
    { href: "/staff/scan", label: "Scan", icon: "/images/scan.svg" },
    { href: "/staff/reports", label: "Reports", icon: "/images/piechart.svg" },
    { href: "/staff/settings", label: "Settings", icon: "/images/settings.svg" },
  ];

 return (
    <nav className="bottom-nav">
      {navItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={`nav-item ${router.pathname === item.href ? "active" : ""}`}
        >
          <img src={item.icon} alt={item.label} />
          <span>{item.label}</span>
        </Link>
      ))}
    </nav>
  );
}
