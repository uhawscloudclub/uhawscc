import { Suspense } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Navigate, Route, Routes, useLocation } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { lazyWithReload } from "@/lib/lazyWithReload";
import Index from "./pages/Index.tsx";
import ScrollToTop from "./components/ScrollToTop.tsx";
import ErrorBoundary from "./components/ErrorBoundary.tsx";
import { LEGACY_ROUTES, legacyRedirectTarget } from "../server/legacyRoutes.js";

// All non-home pages are lazy-loaded so their JS is excluded from the initial
// bundle. The home page (Index) stays eager since it's the Lighthouse test target.
// lazyWithReload (not React.lazy directly) lets ErrorBoundary tell a stale-chunk
// import() failure (after a new deploy) apart from a real render error and
// recover with a reload instead of showing a dead-end error screen.
const Events        = lazyWithReload(() => import("./pages/Events.tsx"));
const Learn         = lazyWithReload(() => import("./pages/Learn.tsx"));
const Community     = lazyWithReload(() => import("./pages/Community.tsx"));
const Contact       = lazyWithReload(() => import("./pages/Contact.tsx"));
const NotFound      = lazyWithReload(() => import("./pages/NotFound.tsx"));

const queryClient = new QueryClient();

// Old URLs (/about, /team, /learning-paths, /resources, /news). Express
// answers these with a real 301 in production; this covers in-app links, the
// Vite dev server, and any tab still running a pre-redirect bundle.
const LegacyRedirect = ({ to }: { to: string }) => {
  const { search } = useLocation();
  return <Navigate to={legacyRedirectTarget(to, search)} replace />;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <ErrorBoundary>
          <ScrollToTop />
          <Suspense fallback={null}>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/events" element={<Events />} />
              <Route path="/learn" element={<Learn />} />
              <Route path="/community" element={<Community />} />
              <Route path="/contact" element={<Contact />} />
              {Object.entries(LEGACY_ROUTES).map(([from, to]) => (
                <Route key={from} path={from} element={<LegacyRedirect to={to} />} />
              ))}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </ErrorBoundary>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
