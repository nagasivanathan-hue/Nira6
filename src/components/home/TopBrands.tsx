'use client';
import { BRANDS } from '@/lib/constants';

export default function TopBrands() {
  const allBrands = [...BRANDS, ...BRANDS];
  return (
    <section className="py-16 lg:py-20 bg-nira-gray overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-10">
        <h2 className="font-heading font-bold text-2xl lg:text-3xl text-center">Trusted Brands</h2>
        <p className="text-nira-text-secondary text-center mt-2">Shop from the world&apos;s leading camera and equipment brands</p>
      </div>
      <div className="relative">
        <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-nira-gray to-transparent z-10" />
        <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-nira-gray to-transparent z-10" />
        <div className="marquee-track">
          {allBrands.map((brand, i) => (
            <div key={`${brand.id}-${i}`} className="flex items-center justify-center mx-8 lg:mx-12">
              <div className="flex items-center gap-3 px-8 py-4 bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                <div className="w-10 h-10 bg-nira-dark rounded-xl flex items-center justify-center text-white font-heading font-bold text-sm">
                  {brand.name.charAt(0)}
                </div>
                <span className="font-heading font-semibold text-lg whitespace-nowrap">{brand.name}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
