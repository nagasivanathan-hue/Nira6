import type { Metadata } from "next";
import Script from "next/script";
import { Inter, Poppins } from 'next/font/google';
import "./globals.css";
import ReduxProvider from "@/store/ReduxProvider";
import StoreInitializer from "@/components/layout/StoreInitializer";
import AuthGate from "@/components/layout/AuthGate";
import PwaRegister from "@/components/layout/PwaRegister";
import ErrorBoundary from "@/components/layout/ErrorBoundary";

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
  title: "NIRA6 | India's Premium Creative Marketplace",
  description: "India's premium recommerce platform for creators. Buy, sell, rent, and repair cameras, drones, lenses, and creator equipment at the best prices.",
  keywords: "buy used cameras, sell cameras india, rent camera equipment, creator marketplace, refurbished cameras, used drones, camera rental",
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: '/assets/logo.png',
    shortcut: '/assets/logo.png',
    apple: '/assets/logo.png',
  },
  metadataBase: new URL('https://www.nira6.in'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: "NIRA6 | India's Premium Creative Marketplace",
    description: "India's premium recommerce platform for creators. Buy, sell, rent, and repair cameras, drones, lenses, and creator equipment at the best prices.",
    type: "website",
    locale: "en_IN",
    siteName: "NIRA6",
    url: "https://www.nira6.in/",
    images: [
      {
        url: "https://www.nira6.in/assets/logos/Social_Share_OG.png",
        width: 1200,
        height: 630,
        alt: "NIRA6 - India's Premium Creative Marketplace",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "NIRA6 | India's Premium Creative Marketplace",
    description: "India's premium recommerce platform for creators. Buy, sell, rent, and repair cameras, drones, lenses, and creator equipment.",
    images: ["https://www.nira6.in/assets/logos/Social_Share_OG.png"],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${inter.variable} ${poppins.variable}`}>
      <head>
        <link rel="sitemap" type="application/xml" href="/sitemap.xml" />
      </head>
      <body className="antialiased">
        {/* BUG-002: noscript fallback for crawlers and users without JS */}
        <noscript>
          <div style={{ backgroundColor: '#0A0A0A', color: '#ffffff', fontFamily: 'system-ui, sans-serif', padding: '40px 20px', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
            <h1 style={{ color: '#FFDA03', fontSize: '48px', fontWeight: 800, marginBottom: '16px' }}>NIRA6</h1>
            <p style={{ color: '#cccccc', fontSize: '18px', maxWidth: '600px', lineHeight: 1.6, marginBottom: '24px' }}>
              India&apos;s premium recommerce platform for creators. Buy, sell, rent, and repair cameras, drones, lenses, and creator equipment at the best prices.
            </p>
            <a href="/auth/login" style={{ display: 'inline-block', padding: '14px 32px', backgroundColor: '#FFDA03', color: '#0A0A0A', fontWeight: 700, textDecoration: 'none', borderRadius: '8px', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '1px' }}>
              Join the Waitlist
            </a>
          </div>
        </noscript>

        <ReduxProvider>
          <StoreInitializer>
            <PwaRegister />
            <ErrorBoundary>
              <AuthGate>
                {children}
              </AuthGate>
            </ErrorBoundary>
          </StoreInitializer>
        </ReduxProvider>
        <Script src="https://checkout.razorpay.com/v1/checkout.js" />
      </body>
    </html>
  );
}
