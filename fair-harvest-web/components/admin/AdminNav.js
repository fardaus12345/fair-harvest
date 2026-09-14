"use client";

import { usePathname } from "next/navigation";

const links = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/verification", label: "Verification" },
  { href: "/admin/farmers", label: "Farmers" },
  { href: "/admin/products", label: "Products" },
  { href: "/admin/customers", label: "Customers" },
  { href: "/admin/orders", label: "Orders" },
  { href: "/admin/reviews", label: "Reviews" }
];

export default function AdminNav() {
  const pathname = usePathname();

  return (
    <nav className="tabs" aria-label="Admin navigation">
      {links.map((link) => (
        <a key={link.href} href={link.href} className={pathname === link.href ? "active" : ""}>
          {link.label}
        </a>
      ))}
    </nav>
  );
}
