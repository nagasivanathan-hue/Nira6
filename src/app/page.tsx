import HeroSection from '@/components/home/HeroSection';
import dynamic from 'next/dynamic';

const CategoryGrid = dynamic(() => import('@/components/home/CategoryGrid'), { ssr: true });
const FeaturedDeals = dynamic(() => import('@/components/home/FeaturedDeals'), { ssr: true });
const TrendingGear = dynamic(() => import('@/components/home/TrendingGear'), { ssr: true });
const CreatorPicks = dynamic(() => import('@/components/home/CreatorPicks'), { ssr: true });
const TopBrands = dynamic(() => import('@/components/home/TopBrands'), { ssr: true });
const Testimonials = dynamic(() => import('@/components/home/Testimonials'), { ssr: true });
const BlogPreview = dynamic(() => import('@/components/home/BlogPreview'), { ssr: true });

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <CategoryGrid />
      <FeaturedDeals />
      <CreatorPicks />
      <TrendingGear />
      <TopBrands />
      <Testimonials />
      <BlogPreview />
    </>
  );
}
