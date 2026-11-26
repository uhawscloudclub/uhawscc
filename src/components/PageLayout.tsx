import { ReactNode } from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import GridBackground from './GridBackground';
import NetworkCanvas from './NetworkCanvas';

type Intensity = 'low' | 'medium' | 'high';

/**
 * theme="pixel" is the Stage 3 design preview (src/index.css, .theme-pixel):
 * new palette and type, and no animated network canvas or grid behind the
 * page, just a quiet static background. Other pages keep the current look
 * until the preview is approved.
 */
const PageLayout = ({
  children,
  intensity = 'medium',
  theme = 'current',
}: {
  children: ReactNode;
  intensity?: Intensity;
  theme?: 'current' | 'pixel';
}) => (
  <div className={`min-h-screen flex flex-col relative ${theme === 'pixel' ? 'theme-pixel' : ''}`}>
    {theme !== 'pixel' && (
      <>
        <GridBackground />
        <NetworkCanvas intensity={intensity} />
      </>
    )}
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
      className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[60] focus:px-4 focus:py-3 focus:rounded focus:bg-background focus:text-foreground focus:border focus:border-border"
    >
      Skip to main content
    </a>
    <Navbar />
    <main
      id="main-content"
      tabIndex={-1}
      className="flex-1 relative z-10 pt-16 bg-background/85 page-enter focus:outline-none"
    >
      {children}
    </main>
    <Footer />
  </div>
);

export default PageLayout;
