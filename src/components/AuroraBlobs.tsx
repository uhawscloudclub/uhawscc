const AuroraBlobs = () => (
  <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
    <div
      className="absolute top-1/4 -left-32 w-[500px] h-[500px] rounded-full opacity-20"
      style={{
        background: 'radial-gradient(circle, hsla(263, 70%, 66%, 0.4), transparent 70%)',
        animation: 'aurora-1 12s ease-in-out infinite',
      }}
    />
    <div
      className="absolute bottom-1/4 -right-32 w-[600px] h-[600px] rounded-full opacity-15"
      style={{
        background: 'radial-gradient(circle, hsla(187, 94%, 43%, 0.3), transparent 70%)',
        animation: 'aurora-2 15s ease-in-out infinite',
      }}
    />
    <div
      className="absolute top-2/3 left-1/3 w-[400px] h-[400px] rounded-full opacity-10"
      style={{
        background: 'radial-gradient(circle, hsla(263, 70%, 66%, 0.3), transparent 70%)',
        animation: 'aurora-2 18s ease-in-out infinite',
      }}
    />
  </div>
);

export default AuroraBlobs;
