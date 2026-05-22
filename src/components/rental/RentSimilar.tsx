'use client';
import { motion } from 'framer-motion';
import RentalCard from './RentalCard';

export default function RentSimilar({ items }: { items: any[] }) {
  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
      <h2 className="font-heading font-bold text-lg text-white mb-6">You May Also Like</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {items.map((item, i) => (
          <RentalCard key={item.id || item._id} item={item} index={i} />
        ))}
      </div>
    </motion.div>
  );
}
