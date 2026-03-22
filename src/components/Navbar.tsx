import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Cloud, Menu, X } from 'lucide-react';

const navLinks = [
  { label: 'About', to: '/about' },
  { label: 'Events', to: '/events' },
  { label: 'Resources', to: '/resources' },
  { label: 'Team', to: '/team' },
];

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => setOpen(false), [location]);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'glass shadow-lg' : 'bg-transparent'
      }`}
    >
      <div className="container mx-auto px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <Cloud className="w-6 h-6 text-primary transition-transform duration-200 group-hover:scale-110 group-active:scale-95" />
          <span className="font-heading font-bold text-sm sm:text-base text-foreground">
            AWS Cloud Club <span className="text-muted-foreground hidden sm:inline">at UH</span>
          </span>
        </Link>

        {/* Desktop */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`text-sm font-medium transition-colors duration-200 hover:text-primary ${
                location.pathname === link.to ? 'text-primary' : 'text-muted-foreground'
              }`}
            >
              {link.label}
            </Link>
          ))}
          <a
            href="https://www.meetup.com/aws-cloud-club-at-univ-of-houston/?eventOrigin=your_groups"
            target="_blank"
            rel="noopener noreferrer"
            className="px-5 py-2 rounded-full bg-primary text-primary-foreground text-sm font-semibold transition-all duration-200 hover:opacity-90 active:scale-95 glow-purple"
          >
            Join the Club
          </a>
        </div>

        {/* Mobile toggle */}
        <button
          onClick={() => setOpen(!open)}
          className="md:hidden p-2 text-foreground active:scale-95 transition-transform"
        >
          {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden glass border-t border-border/30 animate-fade-up">
          <div className="container mx-auto px-6 py-4 flex flex-col gap-3">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`text-sm font-medium py-2 transition-colors ${
                  location.pathname === link.to ? 'text-primary' : 'text-muted-foreground'
                }`}
              >
                {link.label}
              </Link>
            ))}
            <a
              href="https://www.meetup.com/aws-cloud-club-at-univ-of-houston/?eventOrigin=your_groups"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 px-5 py-2.5 rounded-full bg-primary text-primary-foreground text-sm font-semibold text-center"
            >
              Join the Club
            </a>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
