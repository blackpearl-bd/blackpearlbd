import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { DealGrid } from '@/components/deals/DealGrid';
import { useDeals } from '@/hooks/useDeals';
import { Compass, Package, Star, ArrowRight } from 'lucide-react';

export default function Home() {
  const { deals, isLoading } = useDeals();
  const featuredDeals = deals.filter((d) => d.is_featured).slice(0, 6);

  return (
    <div>
      {/* Hero Section */}
      <section className="relative bg-primary text-white overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-slate-800 to-slate-900" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Discover Your Next
              <span className="text-secondary"> Adventure</span>
            </h1>
            <p className="text-xl text-slate-300 mb-8">
              BlackPearl brings you curated tour deals and custom packages 
              to the world's most amazing destinations.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/deals">
                <Button size="lg" className="bg-secondary hover:bg-secondary/90">
                  Explore Tour Deals
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <Link to="/build-package">
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
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
            <p className="text-slate-600">Handpicked destinations for unforgettable experiences</p>
          </div>
          {isLoading ? (
            <div className="text-center py-12 text-slate-500">Loading deals...</div>
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
      <section className="py-16 bg-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-primary mb-4">How It Works</h2>
            <p className="text-slate-600">Three simple steps to your dream vacation</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="text-center">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Compass className="w-8 h-8 text-secondary" />
                </div>
                <h3 className="text-xl font-semibold text-primary mb-2">Choose Your Destination</h3>
                <p className="text-slate-600">
                  Browse our curated tour deals or build your own custom package
                </p>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Package className="w-8 h-8 text-secondary" />
                </div>
                <h3 className="text-xl font-semibold text-primary mb-2">Customize Your Trip</h3>
                <p className="text-slate-600">
                  Select dates, accommodation, activities, and set your budget
                </p>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Star className="w-8 h-8 text-secondary" />
                </div>
                <h3 className="text-xl font-semibold text-primary mb-2">Book & Earn Pearls</h3>
                <p className="text-slate-600">
                  Confirm your booking, get your invoice, and earn loyalty pearls
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <Card className="bg-gradient-to-r from-primary to-slate-800 text-white">
          <CardContent className="p-12 text-center">
            <h2 className="text-3xl font-bold mb-4">Ready to Start Your Journey?</h2>
            <p className="text-slate-300 mb-8 max-w-2xl mx-auto">
              Create your custom package and let us handle the rest. 
              Earn pearls with every booking and unlock exclusive benefits.
            </p>
            <Link to="/build-package">
              <Button size="lg" className="bg-secondary hover:bg-secondary/90">
                Build Your Package
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
