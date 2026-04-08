import { Link } from 'react-router-dom';
import { Instagram, Linkedin, MessageCircle } from 'lucide-react';
import { EXTERNAL_LINKS } from '@/config/externalLinks';

const Footer = () => (
  <footer className="relative z-10 border-t border-border/30 bg-background/80 backdrop-blur-sm">
    <div className="container mx-auto px-6 py-12">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
        {/* Left */}
        <div>
          <p className="font-heading font-bold text-foreground">AWS Cloud Club at the University of Houston</p>
          <a href={`mailto:${EXTERNAL_LINKS.emailContact}`} className="text-sm text-muted-foreground hover:text-primary transition-colors mt-1 inline-block">
            {EXTERNAL_LINKS.emailContact}
          </a>
        </div>

        {/* Center */}
        <div className="flex flex-wrap gap-6 md:justify-center">
          {[
            { label: 'About', to: '/about' },
            { label: 'Events', to: '/events' },
            { label: 'Resources', to: '/resources' },
            { label: 'Team', to: '/team' },
          ].map((l) => (
            <Link key={l.to} to={l.to} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              {l.label}
            </Link>
          ))}
        </div>

        {/* Right — social icons */}
        <div className="flex gap-4 md:justify-end">
          <a href={EXTERNAL_LINKS.linkedin} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn"
            className="p-2 rounded-lg text-muted-foreground hover:text-primary hover:bg-muted/50 transition-all active:scale-95">
            <Linkedin className="w-5 h-5" />
          </a>
          <a href={EXTERNAL_LINKS.instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram"
            className="p-2 rounded-lg text-muted-foreground hover:text-primary hover:bg-muted/50 transition-all active:scale-95">
            <Instagram className="w-5 h-5" />
          </a>
          <a href={EXTERNAL_LINKS.discord} target="_blank" rel="noopener noreferrer" aria-label="Discord"
            className="p-2 rounded-lg text-muted-foreground hover:text-secondary hover:bg-muted/50 transition-all active:scale-95">
            <MessageCircle className="w-5 h-5" />
          </a>
        </div>
      </div>

      <div className="mt-8 pt-6 border-t border-border/20 text-center text-xs text-muted-foreground leading-relaxed">
        © 2025 AWS Cloud Club at UH. Not an official AWS or Amazon employee organization.
        <br className="hidden sm:inline" /> AWS Cloud Clubs is a program by Amazon Web Services.
      </div>
    </div>
  </footer>
);

export default Footer;
