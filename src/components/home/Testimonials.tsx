'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, ChevronLeft, ChevronRight, Quote } from 'lucide-react';
import { mockTestimonials } from '@/lib/mockData';

export default function Testimonials() {
  const [current, setCurrent] = useState(0);
  const t = mockTestimonials[current];

  return (
    <section className="py-16 lg:py-24 bg-nira-dark text-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="font-heading font-bold text-2xl lg:text-3xl mb-2">What Creators Say</h2>
        <p className="text-white/50 mb-12">Join thousands of happy creators who trust NIRA6</p>

        <div className="relative min-h-[200px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={current}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Quote className="w-10 h-10 text-nira-yellow/30 mx-auto mb-6" />
              <p className="text-lg lg:text-xl text-white/80 leading-relaxed mb-8 max-w-2xl mx-auto italic">
                &quot;{t.comment}&quot;
              </p>
              <div className="flex items-center justify-center gap-1 mb-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className={`w-4 h-4 ${i < t.rating ? 'text-nira-yellow fill-nira-yellow' : 'text-white/20'}`} />
                ))}
              </div>
              <div className="w-12 h-12 rounded-full bg-nira-yellow/20 flex items-center justify-center mx-auto mb-3">
                <span className="font-heading font-bold text-nira-yellow">{t.name.charAt(0)}</span>
              </div>
              <p className="font-semibold">{t.name}</p>
              <p className="text-white/50 text-sm">{t.role}</p>
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="flex items-center justify-center gap-4 mt-8">
          <button onClick={() => setCurrent((c) => (c === 0 ? mockTestimonials.length - 1 : c - 1))} className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors" aria-label="Previous">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="flex gap-2">
            {mockTestimonials.map((_, i) => (
              <button key={i} onClick={() => setCurrent(i)} className={`w-2.5 h-2.5 rounded-full transition-colors ${i === current ? 'bg-nira-yellow' : 'bg-white/20'}`} aria-label={`Testimonial ${i + 1}`} />
            ))}
          </div>
          <button onClick={() => setCurrent((c) => (c === mockTestimonials.length - 1 ? 0 : c + 1))} className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors" aria-label="Next">
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </section>
  );
}
