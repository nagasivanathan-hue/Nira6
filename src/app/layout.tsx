import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
import ReduxProvider from "@/store/ReduxProvider";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import StoreInitializer from "@/components/layout/StoreInitializer";
import LiveChatWidget from "@/components/support/LiveChatWidget";

export const metadata: Metadata = {
  title: "NIRA6 — Everything for a Creator in One Place",
  description: "India's premium AI-powered recommerce platform for creators. Buy, sell, rent, and repair cameras, drones, lenses, and creator equipment at the best prices.",
  keywords: "buy used cameras, sell cameras india, rent camera equipment, creator marketplace, refurbished cameras, used drones, camera rental",
  openGraph: {
    title: "NIRA6 — Everything for a Creator in One Place",
    description: "India's premium AI-powered recommerce platform for creators.",
    type: "website",
    locale: "en_IN",
    siteName: "NIRA6",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <ReduxProvider>
          <StoreInitializer>
            <Navbar />
            <main className="min-h-screen">{children}</main>
            <Footer />
            <LiveChatWidget />
          </StoreInitializer>
        </ReduxProvider>
        <Script src="https://checkout.razorpay.com/v1/checkout.js" />
      </body>
    </html>
  );
}

