import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import PixelIcon from '@/components/PixelIcon';
import { EXTERNAL_LINKS } from '@/config/externalLinks';
import clubLogo from '@/images/aws-student-builder-group-logo.png';

// Mirrors the sitemap: four destinations plus the Meetup CTA.
const navLinks = [
  { label: 'Events', to: '/events' },
  { label: 'Learn', to: '/learn' },
  { label: 'Community', to: '/community' },
  { label: 'Contact', to: '/contact' },
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
      // Always solid: the hero art (moon, stars) must never sit behind nav text.
      className={`site-nav fixed top-0 left-0 right-0 z-50 ${scrolled ? 'scrolled-nav' : ''}`}
    >
      <div className="container mx-auto px-6 h-16 flex items-center justify-between">
        <Link to="/" aria-label="AWS SBG at UH, home" className="flex items-center gap-2.5 group">
          <img
            src={clubLogo}
            alt=""
            className="w-7 h-7 object-contain transition-transform duration-200 group-hover:scale-105"
          />
          <span className="font-heading font-bold text-sm text-foreground">
            AWS SBG{' '}
            <span className="text-muted-foreground font-normal">at UH</span>
          </span>
        </Link>

        {/* Desktop — lg breakpoint keeps the logo, 4 links and CTA on one line */}
        <div className="hidden lg:flex items-center gap-6">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              aria-current={location.pathname === link.to ? 'page' : undefined}
              className={`text-[0.9375rem] font-semibold py-2 transition-colors duration-150 hover:text-foreground relative ${
                location.pathname === link.to
                  ? 'text-primary after:absolute after:bottom-0 after:left-0 after:right-0'
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
            className="nav-cta px-4 py-2"
          >
            Join on Meetup
          </a>
        </div>

        {/* Mobile/tablet toggle — visible below lg */}
        <button
          onClick={() => setOpen(!open)}
          aria-label={open ? 'Close navigation' : 'Open navigation'}
          aria-expanded={open}
          className="lg:hidden p-3 text-foreground"
        >
          <PixelIcon name={open ? 'close' : 'menu'} size={18} />
        </button>
      </div>

      {/* Mobile/tablet menu */}
      {open && (
        <div className="lg:hidden bg-background border-t-2 border-[var(--hull-shadow)]">
          <div className="container mx-auto px-6 py-4 flex flex-col gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                aria-current={location.pathname === link.to ? 'page' : undefined}
                className={`text-base font-semibold py-3 px-3 transition-colors ${
                  location.pathname === link.to
                    ? 'text-primary bg-[var(--hull)]'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {link.label}
              </Link>
            ))}
            <a
              href={EXTERNAL_LINKS.meetup}
              target="_blank"
              rel="noopener noreferrer"
              className="nav-cta mt-3 px-4 py-3 text-center block"
            >
              Join on Meetup
            </a>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
