import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import PageLayout from '@/components/PageLayout';
import { ArrowRight } from 'lucide-react';

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    if (import.meta.env.DEV) {
      console.error("404 Error: User attempted to access non-existent route:", location.pathname);
    }
  }, [location.pathname]);

  return (
    <PageLayout>
      <section className="relative z-10 min-h-screen flex flex-col justify-center">
        <div className="container mx-auto px-6">
          <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground mb-4 font-mono">
            404
          </p>
          <h1
            className="font-heading font-extrabold leading-[0.88] tracking-tight text-foreground mb-6"
            style={{ fontSize: 'clamp(2.5rem, 6vw, 4.5rem)' }}
          >
            Page not<br />
            <span style={{ color: 'var(--primary)' }}>found.</span>
          </h1>
          <p className="text-muted-foreground text-base leading-relaxed max-w-[45ch] mb-10">
            That route does not exist. You may have followed a broken link or
            mistyped the URL.
          </p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-6 py-3 rounded bg-primary text-primary-foreground font-semibold text-sm transition-all duration-150 hover:opacity-90 active:scale-[0.98]"
          >
            Back to home
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </PageLayout>
  );
};

export default NotFound;
