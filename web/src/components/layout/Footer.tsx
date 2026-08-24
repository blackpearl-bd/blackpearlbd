import { Link } from 'react-router-dom';

export function Footer() {
  return (
    <footer className="bg-hero text-hero-foreground">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <img src="/blackpearl.svg" alt="BlackPearl" className="w-8 h-8" />
              <span className="text-xl font-bold">BlackPearl</span>
            </div>
            <p className="text-primary-foreground/70 max-w-md">
              Your premier tours and travel agency. Discover amazing destinations, 
              create custom packages, and embark on unforgettable journeys.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/deals" className="text-primary-foreground/70 hover:text-primary-foreground transition-colors">
                  Tour Deals
                </Link>
              </li>
              <li>
                <Link to="/build-package" className="text-primary-foreground/70 hover:text-primary-foreground transition-colors">
                  Build Package
                </Link>
              </li>
              <li>
                <Link to="/profile" className="text-primary-foreground/70 hover:text-primary-foreground transition-colors">
                  My Profile
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact</h3>
            <ul className="space-y-2 text-primary-foreground/70">
              <li>support@blackpearl.travel</li>
              <li>+91 123 456 7890</li>
              <li>Mumbai, India</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-primary-foreground/20 mt-8 pt-8 text-center text-primary-foreground/50">
          <p>&copy; {new Date().getFullYear()} BlackPearl. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
