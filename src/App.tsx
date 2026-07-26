import { Suspense } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { lazyWithReload } from "@/lib/lazyWithReload";
import Index from "./pages/Index.tsx";
import ScrollToTop from "./components/ScrollToTop.tsx";
import ErrorBoundary from "./components/ErrorBoundary.tsx";

// All non-home pages are lazy-loaded so their JS is excluded from the initial
// bundle. The home page (Index) stays eager since it's the Lighthouse test target.
// lazyWithReload (not React.lazy directly) lets ErrorBoundary tell a stale-chunk
// import() failure (after a new deploy) apart from a real render error and
// recover with a reload instead of showing a dead-end error screen.
const About         = lazyWithReload(() => import("./pages/About.tsx"));
const Events        = lazyWithReload(() => import("./pages/Events.tsx"));
const LearningPaths = lazyWithReload(() => import("./pages/LearningPaths.tsx"));
const Resources     = lazyWithReload(() => import("./pages/Resources.tsx"));
const Team          = lazyWithReload(() => import("./pages/Team.tsx"));
const News          = lazyWithReload(() => import("./pages/News.tsx"));
const Contact       = lazyWithReload(() => import("./pages/Contact.tsx"));
const NotFound      = lazyWithReload(() => import("./pages/NotFound.tsx"));

const queryClient = new QueryClient();

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
              <Route path="/about" element={<About />} />
              <Route path="/events" element={<Events />} />
              <Route path="/learning-paths" element={<LearningPaths />} />
              <Route path="/resources" element={<Resources />} />
              <Route path="/news" element={<News />} />
              <Route path="/team" element={<Team />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </ErrorBoundary>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
