'use client';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { ArrowRight, Shield, Truck, Award, Star } from 'lucide-react';

export default function HeroSection() {
  return (
    <section className="relative min-h-[90vh] hero-gradient overflow-hidden flex items-center">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-nira-yellow/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-blue-500/10 rounded-full blur-[100px]" />
        <div className="absolute top-10 right-10 w-2 h-2 bg-nira-yellow rounded-full animate-pulse-glow" />
        <div className="absolute top-40 left-20 w-1.5 h-1.5 bg-white/40 rounded-full animate-bounce-gentle" />
        <div className="absolute bottom-32 left-1/3 w-1 h-1 bg-nira-yellow/60 rounded-full animate-float" />
      </div>

      {/* Floating Product Images */}
      <motion.div
        animate={{ y: [0, -20, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-20 right-[15%] hidden xl:block"
      >
        <div className="w-32 h-32 rounded-2xl overflow-hidden shadow-2xl shadow-black/40 rotate-6">
          <Image src="/assets/product-camera.png" alt="" fill className="object-cover" />
        </div>
      </motion.div>
      <motion.div
        animate={{ y: [0, 15, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
        className="absolute bottom-32 right-[10%] hidden xl:block"
      >
        <div className="w-28 h-28 rounded-2xl overflow-hidden shadow-2xl shadow-black/40 -rotate-6">
          <Image src="/assets/product-drone.png" alt="" fill className="object-cover" />
        </div>
      </motion.div>
      <motion.div
        animate={{ y: [0, -15, 0] }}
        transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
        className="absolute top-1/3 right-[5%] hidden xl:block"
      >
        <div className="w-24 h-24 rounded-2xl overflow-hidden shadow-2xl shadow-black/40 rotate-12">
          <Image src="/assets/product-lens.png" alt="" fill className="object-cover" />
        </div>
      </motion.div>

      {/* Content */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
        <div className="max-w-3xl">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-nira-yellow/10 border border-nira-yellow/30 rounded-full mb-6"
          >
            <Star className="w-4 h-4 text-nira-yellow fill-nira-yellow" />
            <span className="text-nira-yellow text-sm font-medium">India&apos;s #1 Creator Marketplace</span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="font-heading font-black text-4xl sm:text-5xl lg:text-7xl text-white leading-[1.1] mb-6"
          >
            EVERYTHING
            <br />
            FOR A <span className="text-nira-yellow">CREATOR</span>
            <br />
            IN ONE PLACE.
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-white/60 text-lg sm:text-xl mb-8 max-w-lg"
          >
            Buy. Sell. Rent. Repair. Create. — The ultimate platform for cameras, lenses, drones, and creator gear.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex flex-wrap gap-3 mb-12"
          >
            <Link
              href="/sell"
              className="group flex items-center gap-2 px-7 py-3.5 bg-nira-yellow text-nira-dark font-semibold rounded-xl hover:bg-nira-yellow-dark transition-all hover:shadow-lg hover:shadow-nira-yellow/25"
            >
              Sell Now
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/buy"
              className="flex items-center gap-2 px-7 py-3.5 bg-white/10 text-white font-semibold rounded-xl border border-white/20 hover:bg-white/20 transition-all"
            >
              Buy Gear
            </Link>
            <Link
              href="/rent"
              className="flex items-center gap-2 px-7 py-3.5 bg-white/10 text-white font-semibold rounded-xl border border-white/20 hover:bg-white/20 transition-all"
            >
              Rent Equipment
            </Link>
          </motion.div>

          {/* Trust Badges */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="flex flex-wrap gap-6 text-white/50 text-sm"
          >
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-nira-success" />
              <span>Verified Quality</span>
            </div>
            <div className="flex items-center gap-2">
              <Truck className="w-4 h-4 text-nira-info" />
              <span>Free Shipping</span>
            </div>
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-nira-yellow" />
              <span>6-Month Warranty</span>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
