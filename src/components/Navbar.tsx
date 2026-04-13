import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { EXTERNAL_LINKS } from '@/config/externalLinks';
import clubLogo from '@/images/AWS_Cloud_Club_at_University_of_Houston-removebg-preview.png';

const navLinks = [
  { label: 'About', to: '/about' },
  { label: 'Events', to: '/events' },
  { label: 'Learning Paths', to: '/learning-paths' },
  { label: 'Resources', to: '/resources' },
  { label: 'News', to: '/news' },
  { label: 'Team', to: '/team' },
  // Contact lives in the footer — omitted from nav to prevent overflow at tablet
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
        scrolled
          ? 'bg-background/80 backdrop-blur-xl border-b border-border/40 shadow-sm'
          : 'bg-transparent'
      }`}
    >
      <div className="container mx-auto px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5 group">
          <img
            src={clubLogo}
            alt="AWS Cloud Club at UH"
            className="w-7 h-7 object-contain transition-transform duration-200 group-hover:scale-105"
          />
          <span className="font-heading font-bold text-sm text-foreground">
            AWS Cloud Club{' '}
            <span className="text-muted-foreground font-normal hidden sm:inline">at UH</span>
          </span>
        </Link>

        {/* Desktop — lg breakpoint so 6 links + CTA don't overflow at tablet */}
        <div className="hidden lg:flex items-center gap-6">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`text-sm font-medium transition-colors duration-200 hover:text-foreground relative ${
                location.pathname === link.to
                  ? 'text-primary after:absolute after:bottom-[-2px] after:left-0 after:right-0 after:h-px after:bg-primary/50 after:rounded-full'
                  : 'text-muted-foreground'
              }`}
            >
              {link.label}
            </Link>
          ))}
          <a
            href={EXTERNAL_LINKS.meetup}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-outline-gradient px-4 py-2 text-sm font-semibold active:scale-95 transition-all duration-200"
          >
            Join the Club
          </a>
        </div>

        {/* Mobile/tablet toggle — visible below lg */}
        <button
          onClick={() => setOpen(!open)}
          aria-label={open ? 'Close navigation' : 'Open navigation'}
          aria-expanded={open}
          className="lg:hidden p-3 text-muted-foreground hover:text-foreground transition-colors"
        >
          {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile/tablet menu */}
      {open && (
        <div className="lg:hidden bg-background/95 backdrop-blur-xl border-t border-border/40 animate-fade-up">
          <div className="container mx-auto px-6 py-4 flex flex-col gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`text-sm font-medium py-2.5 px-3 rounded-lg transition-colors ${
                  location.pathname === link.to
                    ? 'text-primary bg-primary/10'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/30'
                }`}
              >
                {link.label}
              </Link>
            ))}
            <a
              href={EXTERNAL_LINKS.meetup}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-outline-gradient mt-3 px-4 py-2.5 text-sm font-semibold text-center block transition-all duration-200 active:scale-[0.98]"
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
