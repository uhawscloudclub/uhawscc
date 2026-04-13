const GridBackground = () => (
  <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
    {/* Subtle dot grid */}
    <div
      className="absolute inset-0"
      style={{
        backgroundImage: 'radial-gradient(circle, color-mix(in oklch, var(--foreground) 4%, transparent) 1px, transparent 1px)',
        backgroundSize: '32px 32px',
      }}
    />
    {/* Top-center purple glow */}
    <div
      className="absolute -top-48 left-1/2 -translate-x-1/2 w-[900px] h-[700px]"
      style={{
        background: 'radial-gradient(ellipse at center, color-mix(in oklch, var(--primary) 7%, transparent) 0%, transparent 60%)',
      }}
    />
    {/* Radial vignette — fades toward edges */}
    <div
      className="absolute inset-0"
      style={{
        background: 'radial-gradient(ellipse 110% 90% at 50% 50%, transparent 40%, var(--background) 100%)',
      }}
    />
  </div>
);

export default GridBackground;
