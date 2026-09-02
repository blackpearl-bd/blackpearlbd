import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { DealGrid } from '@/components/deals/DealGrid';
import { useDeals } from '@/hooks/useDeals';
import { GlobePolaroids } from '@/components/ui/component';
import { MorphingTabs } from '@/components/watermelon-ui/morphing-tabs';
import { Compass, Star, ArrowRight, MapPin, Clock } from 'lucide-react';
import { BuildPackageIcon } from '@/components/icons/BuildPackageIcon';
import { formatCurrency } from '@/lib/utils';
import type { TourDeal } from '@/types';

function FeaturedDealsPreview({ deals }: { deals: TourDeal[] }) {
  const preview = deals.slice(0, 3);
  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Popular Tour Deals</h3>
        <Link to="/deals" className="text-sm text-primary hover:underline flex items-center gap-1">
          View all <ArrowRight className="w-3 h-3" />
        </Link>
      </div>
      {preview.length === 0 ? (
        <p className="text-muted-foreground text-sm py-4">No deals available right now.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {preview.map((deal) => (
            <Link
              key={deal.id}
              to={`/deals/${deal.slug}`}
              className="group rounded-xl border bg-card p-3 transition-shadow hover:shadow-md"
            >
              <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1.5">
                <MapPin className="w-3 h-3" />
                {deal.destination}
              </div>
              <h4 className="text-sm font-semibold line-clamp-1 group-hover:text-primary transition-colors">
                {deal.title}
              </h4>
              <div className="flex items-center justify-between mt-2">
                <span className="text-sm font-bold">{formatCurrency(deal.price)}</span>
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="w-3 h-3" />
                  {deal.duration_days}D
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

function BuildPackagePreview() {
  const steps = [
    { icon: Compass, label: 'Pick a destination', hint: 'Choose from 50+ destinations' },
    { icon: BuildPackageIcon, label: 'Set your budget', hint: 'We tailor packages to your budget' },
    { icon: Star, label: 'Customize activities', hint: 'Handpick what you love' },
  ];

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Build Your Own Package</h3>
        <Link to="/build-package" className="text-sm text-primary hover:underline flex items-center gap-1">
          Start building <ArrowRight className="w-3 h-3" />
        </Link>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {steps.map((step, i) => (
          <div key={i} className="rounded-xl border bg-card p-3">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center mb-2">
              <step.icon className="w-4 h-4 text-primary" />
            </div>
            <h4 className="text-sm font-semibold">{step.label}</h4>
            <p className="text-xs text-muted-foreground mt-0.5">{step.hint}</p>
          </div>
        ))}
      </div>
      <div className="mt-4 text-center">
        <Link to="/build-package">
          <Button size="sm">
            Start Building
            <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </Link>
      </div>
    </div>
  );
}

export default function Home() {
  const { deals, isLoading } = useDeals();
  const featuredDeals = deals.filter((d) => d.is_featured).slice(0, 6);

  return (
    <div>
      {/* Hero Section */}
      <section className="relative bg-hero text-hero-foreground overflow-hidden">
        <div className="relative max-w-7xl mx-auto px-2 sm:px-6 lg:px-8 py-16 md:py-24">
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

            {/* Morphing Tabs */}
            <div className="text-left w-full">
              <MorphingTabs
                defaultValue="tours"
                ariaLabel="Quick access"
                items={[
                  {
                    id: 'tours',
                    label: 'Tour Deals',
                    icon: <Compass className="w-4 h-4" />,
                    content: <FeaturedDealsPreview deals={featuredDeals} />,
                  },
                  {
                    id: 'packages',
                    label: 'Build Package',
                    icon: <BuildPackageIcon className="w-4 h-4" />,
                    content: <BuildPackagePreview />,
                  },
                ]}
              />
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
                  <BuildPackageIcon className="w-8 h-8 text-primary" />
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
