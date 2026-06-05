'use client';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { CATEGORIES } from '@/lib/constants';
import { Camera, Aperture, Mic, Move3D, Plane, Lightbulb, Package, Wand2, Film, ImagePlus, Building2 } from 'lucide-react';

const iconMap: Record<string, React.ElementType> = {
  Camera, Aperture, Mic, Move3D, Plane, Lightbulb, Package, Wand2, Film, ImagePlus, Building2,
};

const categoryColorClasses: Record<string, { bg: string; text: string }> = {
  cameras: { bg: 'bg-[#FFDA03]/10', text: 'text-[#FFDA03]' },
  lenses: { bg: 'bg-[#FF6B35]/10', text: 'text-[#FF6B35]' },
  microphones: { bg: 'bg-[#4ECDC4]/10', text: 'text-[#4ECDC4]' },
  gimbals: { bg: 'bg-[#A855F7]/10', text: 'text-[#A855F7]' },
  drones: { bg: 'bg-[#3B82F6]/10', text: 'text-[#3B82F6]' },
  lighting: { bg: 'bg-[#F59E0B]/10', text: 'text-[#F59E0B]' },
  accessories: { bg: 'bg-[#10B981]/10', text: 'text-[#10B981]' },
  editing: { bg: 'bg-[#EC4899]/10', text: 'text-[#EC4899]' },
  'video-editors': { bg: 'bg-[#8B5CF6]/10', text: 'text-[#8B5CF6]' },
  'photo-editors': { bg: 'bg-[#06B6D4]/10', text: 'text-[#06B6D4]' },
  studio: { bg: 'bg-[#EF4444]/10', text: 'text-[#EF4444]' },
};

export default function CategoryGrid() {
  return (
    <section className="py-16 lg:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="font-heading font-bold text-3xl lg:text-4xl mb-3">Browse by Category</h2>
          <p className="text-nira-text-secondary max-w-lg mx-auto">Find exactly what you need from our curated collection of creator equipment</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {CATEGORIES.map((cat, i) => {
            const Icon = iconMap[cat.icon] || Camera;
            return (
              <motion.div
                key={cat.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
              >
                <Link
                  href={`/buy?category=${cat.id}`}
                  className="group flex flex-col items-center p-5 rounded-2xl border border-nira-gray-dark hover:border-nira-yellow hover:shadow-lg hover:shadow-nira-yellow/10 transition-all bg-white"
                >
                  <div
                    className={`w-14 h-14 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform ${
                      categoryColorClasses[cat.id]?.bg || 'bg-neutral-100'
                    } ${
                      categoryColorClasses[cat.id]?.text || 'text-neutral-600'
                    }`}
                  >
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="font-medium text-sm text-center">{cat.name}</span>
                  <span className="text-xs text-nira-text-secondary mt-1">{cat.count} items</span>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
