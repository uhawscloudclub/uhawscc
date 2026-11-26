import { ReactNode, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import PixelToaster from './PixelToaster';
import { recordPageVisit } from '@/lib/badges';
import { useRevealOnScroll } from '@/hooks/useRevealOnScroll';

/**
 * Shared page shell. Every page uses the pixel theme (src/index.css,
 * .theme-pixel): night-violet background, Jersey 10 headings, pixel
 * components. No animated background; the hero pixel sky (.px-sky) is opt-in
 * per section.
 */
const PageLayout = ({ children }: { children: ReactNode }) => {
  const { pathname } = useLocation();
  // Runs after PixelToaster (a child) has subscribed, so an Explorer unlock shows.
  useEffect(() => {
    recordPageVisit(pathname);
  }, [pathname]);
  useRevealOnScroll(pathname);
  return (
  <div className="min-h-screen flex flex-col relative theme-pixel">
    {/* Skip link: first thing a keyboard user reaches; visible only on focus. */}
    <a
      href="#main-content"
      onClick={(e) => {
        // Move focus (not just scroll) so the next Tab continues inside main.
        // preventDefault keeps "#main-content" out of the URL.
        const main = document.getElementById('main-content');
        if (!main) return;
        e.preventDefault();
        main.focus();
        main.scrollIntoView();
      }}
      className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[60] focus:px-4 focus:py-3 focus:bg-background focus:text-foreground"
    >
      Skip to main content
    </a>
    <Navbar />
    <main
      id="main-content"
      tabIndex={-1}
      className="flex-1 relative focus:outline-none"
    >
      {children}
    </main>
    <Footer />
    <PixelToaster />
  </div>
  );
};

export default PageLayout;
