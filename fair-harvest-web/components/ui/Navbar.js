"use client";

import { Menu } from "lucide-react";
import LanguageToggle from "../i18n/LanguageToggle.js";
import BrandLogo from "./BrandLogo.js";
import { useSession, clearSession } from "../auth/useSession.js";

const baseLinks = [
  { href: "/marketplace", label: "Marketplace" },
  { href: "/cart", label: "Cart" },
  { href: "/orders", label: "Orders" },
  { href: "/wishlist", label: "Wishlist" },
  { href: "/farmer/dashboard", label: "Farmers" },
  { href: "/scan", label: "AI Tools" },
  { href: "/nutrition", label: "Nutrition" },
  { href: "/rewards", label: "Rewards" }
];

export default function Navbar() {
  const { user, loading } = useSession();
  const links = [...baseLinks, ...(user ? [{ href: "/account", label: "Account" }] : [])];

  return (
    <header className="globalHeader">
      <nav className="topbar" aria-label="Main navigation">
      <a className="brand" href="/">
        <BrandLogo />
      </a>

      <div className="desktopNav">
        {links.map((link) => (
          <a key={link.href} href={link.href}>{link.label}</a>
        ))}
      </div>

      <div className="navActions">
        <LanguageToggle />
        {!loading && user ? (
          <>
            <span className="navStatus">Hi, {user.name}</span>
            <button type="button" className="navCta" onClick={() => { clearSession(); window.location.href = "/"; }}>Log out</button>
          </>
        ) : (
          <a className="navCta" href="/auth">Get started</a>
        )}
        <details className="mobileNav">
          <summary className="hamburger" aria-label="Toggle navigation">
            <Menu size={22} />
          </summary>
          <div className="mobileMenu">
            {links.map((link) => (
              <a key={link.href} href={link.href}>{link.label}</a>
            ))}
            {!loading && user ? (
              <button type="button" onClick={() => { clearSession(); window.location.href = "/"; }}>Log out</button>
            ) : (
              <a href="/auth">Get started</a>
            )}
          </div>
        </details>
      </div>
      </nav>
    </header>
  );
}
