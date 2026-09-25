import Hero from '../components/home/Hero';
import ProductCollection from '../components/home/ProductCollection';
import FeaturedBanner from '../components/home/FeaturedBanner';
import CategoryCarousel from '../components/home/CategoryCarousel';
import BestSellers from '../components/home/BestSellers';
import NewArrival from '../components/home/NewArrival';
import SustainabilitySection from '../components/home/SustainabilitySection';
import Testimonials from '../components/home/Testimonials';
import EditorialSection from '../components/home/EditorialSection';
import SustainabilityCTA from '../components/home/SustainabilityCTA';
import { useShopData } from '../context/DataContext';

const Home = () => {
  const { products } = useShopData();

  return (
    <div className="overflow-hidden">
      <Hero />
      <div id="products">
        <ProductCollection products={products} />
      </div>
      <FeaturedBanner />
      <div id="categories">
        <CategoryCarousel />
      </div>
      <div id="bestsellers">
        <BestSellers products={products} />
      </div>
      <NewArrival products={products} />
      <div id="sustainability">
        <SustainabilitySection />
      </div>
      <Testimonials />
      <EditorialSection />
      <SustainabilityCTA />
    </div>
  );
};

export default Home;
