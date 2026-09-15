"use client";

import { ShieldCheck, ShoppingBasket, Sprout } from "lucide-react";

// Fair Harvest now has a sign-in page per role. This page is kept as the
// role chooser so that every existing link to /auth still lands somewhere
// useful rather than 404ing.
const DOORS = [
  {
    href: "/auth/customer",
    icon: ShoppingBasket,
    title: "I am a customer",
    body: "Browse the marketplace, place orders and review what you have received."
  },
  {
    href: "/auth/farmer",
    icon: Sprout,
    title: "I am a farmer",
    body: "List produce, manage orders and record traceability for your products."
  },
  {
    href: "/admin/login",
    icon: ShieldCheck,
    title: "I am an administrator",
    body: "Verification queue, product and account management, audit log."
  }
];

export default function AuthChooserPage() {
  return (
    <main className="authShell">
      <div className="authColumn authChooser">
        <header className="authHeading">
          <p className="eyebrow">Account</p>
          <h1>How do you use Fair Harvest?</h1>
        </header>

        <div className="resultStack">
          {DOORS.map(({ href, icon: Icon, title, body }) => (
            <a className="toolPanel authDoor" href={href} key={href}>
              <h2><Icon size={20} /> {title}</h2>
              <p className="muted">{body}</p>
            </a>
          ))}
        </div>
      </div>
    </main>
  );
}
