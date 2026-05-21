import type { Metadata } from "next";
import Script from "next/script";
import { Inter, Poppins } from 'next/font/google';
import "./globals.css";
import ReduxProvider from "@/store/ReduxProvider";
import StoreInitializer from "@/components/layout/StoreInitializer";
import AuthGate from "@/components/layout/AuthGate";
import PwaRegister from "@/components/layout/PwaRegister";
import SplashLoader from "@/components/layout/SplashLoader";

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-family-body',
  display: 'swap',
});

const poppins = Poppins({
  weight: ['300', '400', '500', '600', '700', '800', '900'],
  subsets: ['latin'],
  variable: '--font-family-heading',
  display: 'swap',
});

export const metadata: Metadata = {
  title: "NIRA6 — Everything for a Creator in One Place",
  description: "India's premium AI-powered recommerce platform for creators. Buy, sell, rent, and repair cameras, drones, lenses, and creator equipment at the best prices.",
  keywords: "buy used cameras, sell cameras india, rent camera equipment, creator marketplace, refurbished cameras, used drones, camera rental",
  icons: {
    icon: '/assets/logo.png',
    shortcut: '/assets/logo.png',
    apple: '/assets/logo.png',
  },
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
    <html lang="en" className={`${inter.variable} ${poppins.variable}`}>
      <body className="antialiased">
        <ReduxProvider>
          <StoreInitializer>
            <SplashLoader />
            <PwaRegister />
            <AuthGate>
              {children}
            </AuthGate>
          </StoreInitializer>
        </ReduxProvider>
        <Script src="https://checkout.razorpay.com/v1/checkout.js" />
      </body>
    </html>
  );
}

