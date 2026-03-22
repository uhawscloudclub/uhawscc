import { ReactNode } from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import ParticleBackground from './ParticleBackground';
import AuroraBlobs from './AuroraBlobs';

const PageLayout = ({ children }: { children: ReactNode }) => (
  <div className="min-h-screen flex flex-col relative">
    <ParticleBackground />
    <AuroraBlobs />
    <Navbar />
    <main className="flex-1 relative z-10 pt-16">
      {children}
    </main>
    <Footer />
  </div>
);

export default PageLayout;
