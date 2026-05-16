import HeroSection from '@/components/home/HeroSection';
import CategoryGrid from '@/components/home/CategoryGrid';
import FeaturedDeals from '@/components/home/FeaturedDeals';
import TrendingGear from '@/components/home/TrendingGear';
import CreatorPicks from '@/components/home/CreatorPicks';
import TopBrands from '@/components/home/TopBrands';
import Testimonials from '@/components/home/Testimonials';
import BlogPreview from '@/components/home/BlogPreview';

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
