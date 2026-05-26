'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  Check, 
  HelpCircle, 
  Wallet, 
  ShieldCheck, 
  Zap, 
  Users, 
  ShoppingBag, 
  FileText,
  ArrowRight
} from 'lucide-react';

export default function PricingPage() {
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  const plans = [
    {
      name: "Creator Account",
      price: "₹0",
      period: "forever",
      desc: "Perfect for photographers, cinematographers, and editors looking to showcase their portfolios and trade gear.",
      icon: Users,
      color: "from-purple-500/10 to-indigo-500/10",
      borderColor: "group-hover:border-purple-500/30",
      glowColor: "group-hover:shadow-purple-500/10",
      features: [
        "Cinematic portfolio with EXIF extraction",
        "Access to dynamic peer-to-peer Barter Board",
        "Direct creator booking requests & contracts",
        "NIRA Wallet account activation",
        "Upload high-fidelity 4K visual assets",
      ],
      ctaText: "Build Your Portfolio",
      ctaLink: "/auth/signup"
    },
    {
      name: "Merchant / Seller",
      price: "Commission",
      period: "based",
      desc: "For rental houses, gear shops, and individuals wanting to sell or lease high-end film equipment.",
      icon: ShoppingBag,
      color: "from-amber-500/10 to-orange-500/10",
      borderColor: "group-hover:border-amber-500/30",
      glowColor: "group-hover:shadow-amber-500/10",
      features: [
        "Dedicated Seller Dashboard (/seller)",
        "List items for buy-back or daily rental",
        "Secure payments processed via Razorpay",
        "Platform protection & damage verification",
        "Real-time client booking analytics",
      ],
      ctaText: "Open Storefront",
      ctaLink: "/seller"
    },
    {
      name: "AI Concierge & Enterprise",
      price: "Custom",
      period: "per project",
      desc: "For production houses and commercial agencies needing full-scale crew recruitment and gear sourcing.",
      icon: Zap,
      color: "from-cyan-500/10 to-blue-500/10",
      borderColor: "group-hover:border-cyan-500/30",
      glowColor: "group-hover:shadow-cyan-500/10",
      features: [
        "AI Package Matcher inside Studio Dashboard",
        "Recruitment boards with direct crew matching",
        "Custom verified invoicing & bulk accounts",
        "Dedicated account concierge specialist",
        "Extended gear damage coverage terms",
      ],
      ctaText: "Request Quote",
      ctaLink: "/studio"
    }
  ];

  const comparison = [
    { feature: "EXIF Telemetry Ingestion", creator: true, seller: true, enterprise: true },
    { feature: "Peer-to-Peer Bartering", creator: true, seller: false, enterprise: true },
    { feature: "Rental/Sales Listings", creator: false, seller: true, enterprise: true },
    { feature: "Razorpay Checkout Support", creator: true, seller: true, enterprise: true },
    { feature: "Platform Damage Protection", creator: false, seller: true, enterprise: true },
    { feature: "Dedicated Account Manager", creator: false, seller: false, enterprise: true },
    { feature: "Custom API Integration", creator: false, seller: false, enterprise: true },
  ];

  const faqs = [
    {
      q: "How does the NIRA Wallet refund system work?",
      a: "All returns approved via our /api/orders return router are refunded instantly. Instead of waiting for bank transfers, the full transaction amount (including taxes and standard shipping costs) is credited to your NIRA Wallet Balance immediately. You can use this balance to purchase other gear, rent production kits, or book creator services."
    },
    {
      q: "Are there any hidden listing or platform fees?",
      a: "Creating portfolios, posting barter opportunities, and requesting custom quotes are entirely free. We charge a standard transaction commission on direct camera rentals, item sales, and booking contracts processed through our secure Razorpay gateway to maintain service guarantees."
    },
    {
      q: "How do I upgrade to a Seller Account?",
      a: "If you have verified production gear to rent or sell, simply sign up for a standard account and navigate to the Seller tab in your dashboard. You will be prompted to provide identification and equipment inventory proof before listings go live."
    },
    {
      q: "What is the policy for damaged rental equipment?",
      a: "All camera rentals managed through Nira6 require the renter to agree to our standard platform damage protection policy. Security checks and hold balances are handled securely, and disputes are mediated by our dedicated support desk."
    }
  ];

  return (
    <div className="min-h-screen bg-black text-white selection:bg-amber-400 selection:text-black font-sans relative overflow-hidden pb-24">
      {/* Cinematic Glowing Background Accents */}
      <div className="absolute top-[-10%] left-[-20%] w-[600px] h-[600px] rounded-full bg-purple-900/10 blur-[150px] pointer-events-none" />
      <div className="absolute bottom-[20%] right-[-20%] w-[600px] h-[600px] rounded-full bg-amber-900/10 blur-[150px] pointer-events-none" />

      {/* Hero Header */}
      <header className="max-w-7xl mx-auto px-4 pt-20 pb-16 text-center relative z-10">
        <span className="text-[11px] uppercase font-mono tracking-widest text-amber-400 block mb-4">
          [ PLANS & TRANSACTION MATRIX ]
        </span>
        <h1 className="font-heading font-black text-4xl sm:text-6xl text-white tracking-tight leading-tight max-w-4xl mx-auto">
          Transparent, Transactional, Built for Visual Creators
        </h1>
        <p className="text-neutral-400 mt-6 text-base sm:text-lg max-w-2xl mx-auto font-light leading-relaxed">
          No mandatory monthly retainers. Access dynamic marketplaces, EXIF-indexed portfolios, and peer barter networks under a pay-per-use plan.
        </p>
      </header>

      {/* Pricing Cards Grid */}
      <section className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10 mb-28">
        {plans.map((plan, idx) => {
          const Icon = plan.icon;
          return (
            <motion.div
              key={idx}
              whileHover={{ y: -6 }}
              transition={{ duration: 0.3 }}
              className={`card-dark rounded-3xl p-8 bg-white/[0.01] border border-neutral-900 flex flex-col justify-between relative overflow-hidden group transition-all duration-300 ${plan.borderColor} ${plan.glowColor}`}
            >
              {/* Subtle accent hover background */}
              <div className={`absolute inset-0 bg-gradient-to-br ${plan.color} opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none`} />
              
              <div className="relative z-10">
                <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-8 group-hover:bg-white/10 transition-colors">
                  <Icon className="w-5 h-5 text-white" />
                </div>
                
                <h3 className="text-xl font-bold text-white mb-2 tracking-tight group-hover:text-amber-400 transition-colors">
                  {plan.name}
                </h3>
                
                <div className="flex items-baseline gap-1.5 mb-6">
                  <span className="text-4xl font-black text-white tracking-tight">{plan.price}</span>
                  <span className="text-xs text-neutral-500 font-mono">/ {plan.period}</span>
                </div>
                
                <p className="text-neutral-400 text-sm leading-relaxed mb-8 font-light">
                  {plan.desc}
                </p>
                
                <ul className="space-y-4 mb-8">
                  {plan.features.map((feat, fidx) => (
                    <li key={fidx} className="flex items-start gap-3 text-xs text-neutral-300">
                      <Check className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                      <span className="leading-relaxed font-light">{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="relative z-10 pt-4">
                <Link
                  href={plan.ctaLink}
                  className="w-full py-3.5 bg-white hover:bg-neutral-200 text-black font-bold text-xs uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-2 group/btn"
                >
                  {plan.ctaText}
                  <ArrowRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-1" />
                </Link>
              </div>
            </motion.div>
          );
        })}
      </section>

      {/* Feature Comparison Matrix */}
      <section className="max-w-4xl mx-auto px-4 mb-28 relative z-10">
        <h2 className="text-2xl font-bold text-white text-center mb-10 tracking-tight">Compare Platform Matrix</h2>
        <div className="border border-neutral-900 rounded-3xl overflow-hidden bg-white/[0.01]">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-neutral-900 bg-white/[0.02]">
                <th className="py-4 px-6 text-xs uppercase font-mono tracking-wider text-neutral-400">Core Capabilities</th>
                <th className="py-4 px-6 text-xs uppercase font-mono tracking-wider text-neutral-400 text-center">Creator</th>
                <th className="py-4 px-6 text-xs uppercase font-mono tracking-wider text-neutral-400 text-center">Seller</th>
                <th className="py-4 px-6 text-xs uppercase font-mono tracking-wider text-neutral-400 text-center">AI Concierge</th>
              </tr>
            </thead>
            <tbody>
              {comparison.map((item, idx) => (
                <tr key={idx} className="border-b border-neutral-900 hover:bg-white/[0.01] transition-colors">
                  <td className="py-4 px-6 text-sm text-neutral-300 font-light">{item.feature}</td>
                  <td className="py-4 px-6 text-center">
                    {item.creator ? <Check className="w-4 h-4 text-emerald-400 mx-auto" /> : <span className="text-neutral-700 font-mono text-xs">—</span>}
                  </td>
                  <td className="py-4 px-6 text-center">
                    {item.seller ? <Check className="w-4 h-4 text-emerald-400 mx-auto" /> : <span className="text-neutral-700 font-mono text-xs">—</span>}
                  </td>
                  <td className="py-4 px-6 text-center">
                    {item.enterprise ? <Check className="w-4 h-4 text-emerald-400 mx-auto" /> : <span className="text-neutral-700 font-mono text-xs">—</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Wallet Ingestion & Razorpay Banner */}
      <section className="max-w-5xl mx-auto px-4 mb-28 relative z-10">
        <div className="bg-gradient-to-r from-neutral-950 to-neutral-900 border border-neutral-800 rounded-3xl p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="max-w-xl">
            <div className="flex items-center gap-2 mb-4">
              <Wallet className="w-5 h-5 text-amber-400" />
              <span className="text-xs uppercase font-mono tracking-widest text-amber-400">NIRA WALLET LEDGER</span>
            </div>
            <h3 className="text-xl md:text-2xl font-bold text-white mb-4 tracking-tight">
              Instant Returns & Razorpay Integration
            </h3>
            <p className="text-neutral-400 text-sm leading-relaxed font-light">
              We process secure, encrypted checkouts through Razorpay. Returns are approved programmatically and refunded directly into your NIRA Wallet Balance for immediate booking or camera rental offsets.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 shrink-0 w-full md:w-auto">
            <Link
              href="/auth/signup"
              className="py-3 px-6 bg-amber-400 hover:bg-amber-300 text-black font-bold text-xs uppercase tracking-widest rounded-xl text-center transition-all"
            >
              Sign Up Free
            </Link>
            <Link
              href="/contact"
              className="py-3 px-6 border border-neutral-800 hover:border-neutral-600 text-white font-bold text-xs uppercase tracking-widest rounded-xl text-center transition-all"
            >
              Support Desk
            </Link>
          </div>
        </div>
      </section>

      {/* Frequently Asked Questions */}
      <section className="max-w-3xl mx-auto px-4 relative z-10">
        <h2 className="text-2xl font-bold text-white text-center mb-10 tracking-tight">Billing & Platform FAQ</h2>
        <div className="space-y-4">
          {faqs.map((faq, idx) => (
            <div 
              key={idx}
              className="border border-neutral-900 rounded-2xl bg-white/[0.01] overflow-hidden transition-all duration-300"
            >
              <button
                onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                className="w-full py-5 px-6 text-left flex items-center justify-between gap-4 font-bold text-sm text-white hover:text-amber-400 transition-colors"
              >
                <span>{faq.q}</span>
                <HelpCircle className={`w-4 h-4 text-neutral-500 transition-transform duration-300 ${activeFaq === idx ? 'rotate-180 text-amber-400' : ''}`} />
              </button>
              
              {activeFaq === idx && (
                <div className="px-6 pb-6 pt-1 text-xs text-neutral-400 leading-relaxed font-light border-t border-neutral-900/50">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
