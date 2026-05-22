'use client';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';
import RentGallery from '@/components/rental/RentGallery';
import RentSpecs from '@/components/rental/RentSpecs';
import RentBookingPanel from '@/components/rental/RentBookingPanel';
import RentReviews from '@/components/rental/RentReviews';
import RentSimilar from '@/components/rental/RentSimilar';
import { RentalItem } from '@/types';

export default function RentalDetailPage() {
  const params = useParams();
  const [item, setItem] = useState<RentalItem | null>(null);
  const [similar, setSimilar] = useState<RentalItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!params?.id) return;
    fetch(`/api/rentals/${params.id}`)
      .then(res => res.json())
      .then(data => {
        setItem(data.item);
        setSimilar(data.similar || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [params?.id]);

  if (loading) {
    return (
      <div className="rent-dark min-h-screen flex items-center justify-center">
        <Loader2 className="w-6 h-6 text-nira-yellow animate-spin" />
      </div>
    );
  }

  if (!item) {
    return (
      <div className="rent-dark min-h-screen flex flex-col items-center justify-center gap-4">
        <p className="text-white/40 font-heading font-bold text-xl">Item not found</p>
        <Link href="/rent" className="text-nira-yellow text-sm font-bold hover:underline">← Back to Rentals</Link>
      </div>
    );
  }

  return (
    <div className="rent-dark min-h-screen pt-20 lg:pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-6">
          <Link href="/rent" className="inline-flex items-center gap-2 text-white/30 hover:text-nira-yellow text-xs font-bold transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Catalog
          </Link>
        </motion.div>

        {/* Top: Gallery + Booking Panel */}
        <div className="grid lg:grid-cols-5 gap-8 mb-12">
          <div className="lg:col-span-3">
            <RentGallery item={item} />
          </div>
          <div className="lg:col-span-2">
            <RentBookingPanel item={item} />
          </div>
        </div>

        {/* Specs */}
        <RentSpecs item={item} />

        {/* Reviews */}
        <RentReviews reviews={item.reviews || []} rating={item.rating} reviewCount={item.reviewCount} />

        {/* Similar */}
        {similar.length > 0 && <RentSimilar items={similar} />}
      </div>
    </div>
  );
}
