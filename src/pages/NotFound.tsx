import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import PageLayout from '@/components/PageLayout';
import Mascot from '@/components/Mascot';
import SkySparkles from '@/components/SkySparkles';
import { unlockBadge } from '@/lib/badges';
import StarCatcher from '@/components/StarCatcher';

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    if (import.meta.env.DEV) {
      console.error("404 Error: User attempted to access non-existent route:", location.pathname);
    }
  }, [location.pathname]);

  // Hidden badge for finding the page that isn't there.
  useEffect(() => {
    unlockBadge('lost-in-space');
  }, []);

  return (
    <PageLayout>
      <section className="relative overflow-hidden px-sky min-h-[80vh] flex flex-col justify-center">
      <SkySparkles />
        <div className="container mx-auto px-6 pt-28 pb-16 relative">
          <Mascot size={96} className="px-float mb-8" />
          <p className="text-sm font-semibold text-muted-foreground mb-2">Error 404</p>
          <h1 className="mb-5" style={{ fontSize: 'clamp(3rem, 9vw, 5rem)' }}>
            Page not found
          </h1>
          <p className="text-muted-foreground text-base sm:text-lg leading-relaxed max-w-[45ch] mb-8">
            That route does not exist. You may have followed a broken link or
            mistyped the URL.
          </p>
          <Link to="/" className="px-button">
            Back to home
          </Link>
          <div className="mt-14">
            <StarCatcher />
          </div>
        </div>
      </section>
    </PageLayout>
  );
};

export default NotFound;
