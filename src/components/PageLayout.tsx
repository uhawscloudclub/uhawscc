import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import Navbar from './Navbar';
import Footer from './Footer';
import GridBackground from './GridBackground';
import NetworkCanvas from './NetworkCanvas';

type Intensity = 'low' | 'medium' | 'high';

const reducedMotion =
  typeof window !== 'undefined'
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
    : false;

const PageLayout = ({ children, intensity = 'medium' }: { children: ReactNode; intensity?: Intensity }) => (
  <div className="min-h-screen flex flex-col relative">
    <GridBackground />
    <NetworkCanvas intensity={intensity} respectReducedMotion={false} />
    <Navbar />
    {reducedMotion ? (
      <main className="flex-1 relative z-10 pt-16 bg-background/85">{children}</main>
    ) : (
      <motion.main
        className="flex-1 relative z-10 pt-16 bg-background/85"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      >
        {children}
      </motion.main>
    )}
    <Footer />
  </div>
);

export default PageLayout;
