import { Leaf } from "lucide-react";

const footerLinks = [
  { href: "/marketplace", label: "Marketplace" },
  { href: "/orders", label: "Orders" },
  { href: "/nutrition", label: "Nutrition" },
  { href: "/scan", label: "Scanner" },
  { href: "/farmer/dashboard", label: "Farmers" },
  { href: "/rewards", label: "Rewards" }
];

export default function Footer() {
  return (
    <footer className="globalFooter">
      <div className="footerInner">
        <div className="footerBrand">
          <Leaf size={22} />
          <div>
            <strong>Fair Harvest</strong>
            <span>AI-powered organic food and health ecosystem</span>
          </div>
        </div>

        <nav className="footerLinks" aria-label="Footer navigation">
          {footerLinks.map((link) => (
            <a key={link.href} href={link.href}>{link.label}</a>
          ))}
        </nav>

        <p>&copy; 2026 Fair Harvest. Built for trusted soil-to-plate food.</p>
      </div>
    </footer>
  );
}
