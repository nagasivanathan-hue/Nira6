'use client';
import { motion } from 'framer-motion';
import { Star, MessageSquare } from 'lucide-react';

interface RentReviewsProps {
  reviews: any[];
  rating: number;
  reviewCount: number;
}

export default function RentReviews({ reviews, rating, reviewCount }: RentReviewsProps) {
  const ratingBreakdown = [5, 4, 3, 2, 1].map(star => {
    const count = reviews.filter(r => Math.round(r.rating) === star).length;
    const pct = reviewCount > 0 ? (count / reviewCount) * 100 : 0;
    return { star, count, pct };
  });

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="mb-12">
      <h2 className="font-heading font-bold text-lg text-white mb-6">Reviews & Ratings</h2>

      <div className="grid sm:grid-cols-3 gap-6 mb-8">
        {/* Summary */}
        <div className="card-dark rounded-xl p-5 text-center">
          <p className="font-heading font-black text-4xl text-nira-yellow mb-1">{rating}</p>
          <div className="flex items-center justify-center gap-0.5 mb-2">
            {[1, 2, 3, 4, 5].map(s => (
              <Star key={s} className={`w-3.5 h-3.5 ${s <= Math.round(rating) ? 'text-nira-yellow fill-nira-yellow' : 'text-white/10'}`} />
            ))}
          </div>
          <p className="text-[10px] text-white/30 font-medium">{reviewCount} reviews</p>
        </div>

        {/* Breakdown */}
        <div className="sm:col-span-2 card-dark rounded-xl p-5 space-y-2.5">
          {ratingBreakdown.map(({ star, count, pct }) => (
            <div key={star} className="flex items-center gap-3">
              <span className="text-[10px] font-bold text-white/30 w-3">{star}</span>
              <Star className="w-3 h-3 text-nira-yellow/40" />
              <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-nira-yellow rounded-full transition-all" style={{ width: `${pct}%` }} />
              </div>
              <span className="text-[10px] font-bold text-white/20 w-6 text-right">{count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Review List */}
      {reviews.length > 0 ? (
        <div className="space-y-4">
          {reviews.map((review: any, i: number) => (
            <div key={i} className="card-dark rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 bg-nira-yellow/10 rounded-full flex items-center justify-center">
                    <span className="text-[10px] font-black text-nira-yellow">{review.userName?.charAt(0)}</span>
                  </div>
                  <span className="text-xs font-bold text-white/70">{review.userName}</span>
                </div>
                <div className="flex items-center gap-0.5">
                  {[1, 2, 3, 4, 5].map(s => (
                    <Star key={s} className={`w-3 h-3 ${s <= review.rating ? 'text-nira-yellow fill-nira-yellow' : 'text-white/10'}`} />
                  ))}
                </div>
              </div>
              <p className="text-xs text-white/40 leading-relaxed">{review.comment}</p>
            </div>
          ))}
        </div>
      ) : (
        <div className="card-dark rounded-xl p-8 text-center">
          <MessageSquare className="w-6 h-6 text-white/10 mx-auto mb-2" />
          <p className="text-xs text-white/20 font-medium">No reviews yet. Be the first to rent and review!</p>
        </div>
      )}
    </motion.div>
  );
}
