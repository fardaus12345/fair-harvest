import { Leaf, Menu } from "lucide-react";
import LanguageToggle from "../i18n/LanguageToggle.js";

const links = [
  { href: "/marketplace", label: "Marketplace" },
  { href: "/farmer/dashboard", label: "Farmers" },
  { href: "/scan", label: "AI Tools" },
  { href: "/nutrition", label: "Nutrition" },
  { href: "/rewards", label: "Rewards" }
];

export default function Navbar({ connected = true }) {
  return (
    <header className="globalHeader">
      <nav className="topbar" aria-label="Main navigation">
      <a className="brand" href="/">
        <Leaf size={22} />
        <span>Fair Harvest</span>
      </a>

      <div className="desktopNav">
        {links.map((link) => (
          <a key={link.href} href={link.href}>{link.label}</a>
        ))}
      </div>

      <div className="navActions">
        <LanguageToggle />
        <span className="navStatus">API: {connected ? "connected" : "offline mode"}</span>
        <a className="navCta" href="/auth">Get started</a>
        <details className="mobileNav">
          <summary className="hamburger" aria-label="Toggle navigation">
            <Menu size={22} />
          </summary>
          <div className="mobileMenu">
            {links.map((link) => (
              <a key={link.href} href={link.href}>{link.label}</a>
            ))}
            <a href="/auth">Get started</a>
          </div>
        </details>
      </div>
      </nav>
    </header>
  );
}
