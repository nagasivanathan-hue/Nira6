'use client';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Star, Clock, CheckCircle, MapPin, Loader2 } from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import { SERVICE_CATEGORIES } from '@/lib/constants';

const levelColors: Record<string, string> = { Rising: '#6B7280', Pro: '#3B82F6', 'Top Rated': '#A855F7', Elite: '#FFDA03' };

interface Freelancer {
  name: string;
  avatar: string;
  title: string;
  rating: number;
  completedJobs: number;
  location: string;
  verified: boolean;
  level: string;
}

interface ServiceItem {
  _id: string;
  id?: string;
  title: string;
  category: string;
  freelancer: Freelancer;
  price: number;
  deliveryDays: number;
  rating: number;
  reviewCount: number;
  image: string;
  description: string;
  tags: string[];
}

export default function ServicesPage() {
  const [activeCategory, setActiveCategory] = useState('All');
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const categories = ['All', ...SERVICE_CATEGORIES];

  useEffect(() => {
    const fetchServices = async () => {
      setLoading(true);
      setError(null);
      try {
        const params = activeCategory !== 'All' ? `?category=${encodeURIComponent(activeCategory)}` : '';
        const res = await fetch(`/api/services${params}`);
        if (!res.ok) throw new Error('Failed to load services');
        const data = await res.json();
        setServices(data);
      } catch (err: any) {
        console.error('[Services] Fetch error:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchServices();
  }, [activeCategory]);

  return (
    <div className="min-h-screen bg-nira-gray">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="font-heading font-bold text-3xl lg:text-4xl mb-2">Creator Services</h1>
          <p className="text-nira-text-secondary">Hire talented editors, photographers, and videographers</p>
        </div>

        {/* Category Tabs */}
        <div className="flex gap-2 overflow-x-auto scrollbar-hide mb-8 pb-2">
          {categories.map((cat) => (
            <button key={cat} onClick={() => setActiveCategory(cat)} className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${activeCategory === cat ? 'bg-nira-dark text-white' : 'bg-white text-nira-text-secondary hover:bg-nira-gray-dark'}`}>
              {cat}
            </button>
          ))}
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-nira-yellow" />
            <p className="text-sm text-nira-text-secondary font-mono">Loading creator services...</p>
          </div>
        )}

        {/* Error State */}
        {!loading && error && (
          <div className="text-center py-20">
            <p className="text-red-500 mb-2">Failed to load services</p>
            <button onClick={() => setActiveCategory(activeCategory)} className="text-sm text-nira-yellow underline">Retry</button>
          </div>
        )}

        {/* Services Grid */}
        {!loading && !error && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {services.map((service, i) => (
              <motion.div
                key={service._id || service.id || i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-white rounded-2xl overflow-hidden border border-nira-gray-dark hover:shadow-lg transition-all"
              >
                <div className="relative aspect-[16/10] bg-nira-gray overflow-hidden">
                  <Image src={service.image} alt={service.title} fill className="object-cover" />
                  <span className="absolute top-3 left-3 px-3 py-1 bg-white/90 text-nira-dark text-xs font-bold rounded-lg">{service.category}</span>
                </div>
                <div className="p-5">
                  <h3 className="font-semibold mb-3 line-clamp-2">{service.title}</h3>
                  {/* Freelancer */}
                  <div className="flex items-center gap-3 mb-4 p-3 bg-nira-gray rounded-xl">
                    <div className="w-10 h-10 bg-nira-dark text-white rounded-full flex items-center justify-center font-bold text-sm">{service.freelancer.name.charAt(0)}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-sm truncate">{service.freelancer.name}</p>
                        {service.freelancer.verified && <CheckCircle className="w-3.5 h-3.5 text-nira-info flex-shrink-0" />}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-nira-text-secondary">
                        <span style={{ color: levelColors[service.freelancer.level] || '#6B7280' }} className="font-semibold">{service.freelancer.level}</span>
                        <span>•</span>
                        <span className="flex items-center gap-0.5"><MapPin className="w-3 h-3" />{service.freelancer.location}</span>
                      </div>
                    </div>
                  </div>
                  {/* Tags */}
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {service.tags.map((tag) => <span key={tag} className="px-2 py-0.5 bg-nira-gray text-xs rounded-md">{tag}</span>)}
                  </div>
                  {/* Footer */}
                  <div className="flex items-center justify-between pt-3 border-t border-nira-gray-dark">
                    <div className="flex items-center gap-3 text-sm">
                      <span className="flex items-center gap-1"><Star className="w-3.5 h-3.5 text-nira-yellow fill-nira-yellow" />{service.rating}</span>
                      <span className="flex items-center gap-1 text-nira-text-secondary"><Clock className="w-3.5 h-3.5" />{service.deliveryDays}d</span>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-nira-text-secondary">Starting at</p>
                      <p className="font-heading font-bold">{formatPrice(service.price)}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {!loading && !error && services.length === 0 && (
          <div className="text-center py-20 text-nira-text-secondary">
            <p>No services found in this category.</p>
          </div>
        )}
      </div>
    </div>
  );
}
