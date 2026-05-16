'use client';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Camera, Wrench, Users, Repeat } from 'lucide-react';

const services = [
  { icon: Repeat, title: 'Sell Your Gear', desc: 'Get instant AI-powered valuation and sell at the best price', href: '/sell', color: '#FFDA03' },
  { icon: Camera, title: 'Rent Equipment', desc: 'Access premium gear on daily or hourly rentals', href: '/rent', color: '#3B82F6' },
  { icon: Users, title: 'Hire Creators', desc: 'Find editors, photographers, and videographers', href: '/services', color: '#A855F7' },
  { icon: Wrench, title: 'Repair Services', desc: 'Professional diagnostics and repair for your equipment', href: '/repair', color: '#10B981' },
];

export default function CreatorPicks() {
  return (
    <section className="py-16 lg:py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="font-heading font-bold text-2xl lg:text-3xl text-center mb-3">The Creator Ecosystem</h2>
        <p className="text-nira-text-secondary text-center mb-10 max-w-lg mx-auto">Everything you need to create, all in one platform</p>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {services.map((s, i) => (
            <motion.div
              key={s.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <Link href={s.href} className="group block p-6 rounded-2xl border border-nira-gray-dark hover:border-transparent hover:shadow-xl transition-all bg-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl opacity-10 group-hover:opacity-20 transition-opacity" style={{ backgroundColor: s.color }} />
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4" style={{ backgroundColor: s.color + '15', color: s.color }}>
                  <s.icon className="w-6 h-6" />
                </div>
                <h3 className="font-heading font-semibold text-lg mb-2">{s.title}</h3>
                <p className="text-sm text-nira-text-secondary mb-4">{s.desc}</p>
                <span className="inline-flex items-center gap-1 text-sm font-semibold group-hover:gap-2 transition-all" style={{ color: s.color }}>
                  Learn More <ArrowRight className="w-4 h-4" />
                </span>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
