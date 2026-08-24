import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { DealGrid } from '@/components/deals/DealGrid';
import { useDeals } from '@/hooks/useDeals';
import { GlobePolaroids } from '@/components/ui/component';
import { Compass, Package, Star, ArrowRight } from 'lucide-react';

export default function Home() {
  const { deals, isLoading } = useDeals();
  const featuredDeals = deals.filter((d) => d.is_featured).slice(0, 6);

  return (
    <div>
      {/* Hero Section */}
      <section className="relative bg-hero text-hero-foreground overflow-hidden">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <div className="text-center max-w-3xl mx-auto">
            {/* Globe */}
            <div className="mx-auto mb-8 w-56 h-56 md:w-80 md:h-80 lg:w-96 lg:h-96">
              <GlobePolaroids />
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Discover Your Next
              <span className="text-hero-foreground"> Adventure</span>
            </h1>
            <p className="text-xl text-hero-foreground/70 mb-8">
              BlackPearl brings you curated tour deals and custom packages 
              to the world's most amazing destinations.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/deals">
                <Button size="lg" className="!bg-hero-foreground !text-white hover:!bg-hero-foreground/90 !border-0">
                  Explore Tour Deals
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <Link to="/build-package">
                <Button size="lg" variant="outline" className="!border-hero-foreground/30 !text-black hover:!bg-hero-foreground/10">
                  Build Your Package
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Deals */}
      {featuredDeals.length > 0 && (
        <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-primary mb-4">Featured Tour Deals</h2>
            <p className="text-muted-foreground">Handpicked destinations for unforgettable experiences</p>
          </div>
          {isLoading ? (
            <div className="text-center py-12 text-muted-foreground">Loading deals...</div>
          ) : (
            <DealGrid deals={featuredDeals} />
          )}
          <div className="text-center mt-8">
            <Link to="/deals">
              <Button variant="outline" size="lg">
                View All Deals
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </section>
      )}

      {/* How It Works */}
      <section className="py-16 bg-muted">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-primary mb-4">How It Works</h2>
            <p className="text-muted-foreground">Three simple steps to your dream vacation</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="text-center">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Compass className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-primary mb-2">Choose Your Destination</h3>
                <p className="text-muted-foreground">
                  Browse our curated tour deals or build your own custom package
                </p>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Package className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-primary mb-2">Customize Your Trip</h3>
                <p className="text-muted-foreground">
                  Select dates, accommodation, activities, and set your budget
                </p>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Star className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-primary mb-2">Book & Earn Pearls</h3>
                <p className="text-muted-foreground">
                  Confirm your booking, get your invoice, and earn loyalty pearls
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

    </div>
  );
}
