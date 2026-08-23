import "./globals.css";
import Footer from "../components/ui/Footer.js";
import Navbar from "../components/ui/Navbar.js";
import LanguageRuntime from "../components/i18n/LanguageRuntime.js";

export const metadata = {
  title: "Fair Harvest",
  description: "AI-powered organic food and health ecosystem"
};

export const viewport = {
  width: "device-width",
  initialScale: 1
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <LanguageRuntime />
        <Navbar />
        {children}
        <Footer />
      </body>
    </html>
  );
}
