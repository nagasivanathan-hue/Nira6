import type { Metadata, Viewport } from "next";
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
    canonical: 'https://www.nira6.in/',
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

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${inter.variable} ${poppins.variable}`}>
      <head>
        <link rel="sitemap" type="application/xml" href="/sitemap.xml" />
      </head>
      <body className="antialiased">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:bg-[#FFDA03] focus:text-black focus:px-4 focus:py-2 focus:rounded"
        >
          Skip to main content
        </a>

        <noscript>
          <div className="p-8 text-center font-sans bg-[#0A0A0A] text-white min-h-screen flex flex-col items-center justify-center">
            <h1 className="text-[#FFDA03] text-[3rem] font-black mb-4 tracking-[0.1em]">NIRA6</h1>
            <p className="text-[#cccccc] text-lg">NIRA6 requires JavaScript to run. Please enable JavaScript in your browser.</p>
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
