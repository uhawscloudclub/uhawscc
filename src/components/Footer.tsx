import { Link } from 'react-router-dom';
import { Instagram, Linkedin } from 'lucide-react';

const DiscordIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057c.001.025.015.047.035.063a19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
  </svg>
);
import { EXTERNAL_LINKS } from '@/config/externalLinks';

const Footer = () => (
  <footer className="relative z-10 border-t border-border/30 bg-background/80 backdrop-blur-sm">
    <div className="container mx-auto px-6 py-12">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
        {/* Left */}
        <div>
          <p className="font-heading font-bold text-foreground">AWS Cloud Club at the University of Houston</p>
          <Link to="/contact" className="text-sm text-muted-foreground hover:text-primary transition-colors mt-1 inline-block">
            Get in touch →
          </Link>
        </div>

        {/* Center */}
        <div className="flex flex-wrap gap-6 md:justify-center">
          {[
            { label: 'About', to: '/about' },
            { label: 'Events', to: '/events' },
            { label: 'Learning Paths', to: '/learning-paths' },
            { label: 'Resources', to: '/resources' },
            { label: 'News', to: '/news' },
            { label: 'Team', to: '/team' },
            { label: 'Contact', to: '/contact' },
          ].map((l) => (
            <Link key={l.to} to={l.to} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              {l.label}
            </Link>
          ))}
        </div>

        {/* Right — social icons */}
        <div className="flex gap-1 md:justify-end">
          <a href={EXTERNAL_LINKS.linkedin} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn"
            className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg text-muted-foreground hover:text-primary hover:bg-muted/50 transition-colors active:scale-95">
            <Linkedin className="w-5 h-5" />
          </a>
          <a href={EXTERNAL_LINKS.instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram"
            className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg text-muted-foreground hover:text-primary hover:bg-muted/50 transition-colors active:scale-95">
            <Instagram className="w-5 h-5" />
          </a>
          <a href={EXTERNAL_LINKS.discord} target="_blank" rel="noopener noreferrer" aria-label="Discord"
            className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg text-muted-foreground hover:text-secondary hover:bg-muted/50 transition-colors active:scale-95">
            <DiscordIcon className="w-5 h-5" />
          </a>
        </div>
      </div>

      <div className="mt-8 pt-6 border-t border-border/20 text-left md:text-center text-xs text-muted-foreground leading-relaxed">
        © 2026 AWS Cloud Club at UH. Not an official AWS or Amazon employee organization.
        <br className="hidden sm:inline" /> AWS Cloud Clubs is a program by Amazon Web Services.
      </div>
    </div>
  </footer>
);

export default Footer;
