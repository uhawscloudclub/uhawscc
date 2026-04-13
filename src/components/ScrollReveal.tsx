import { useEffect, useRef, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  className?: string;
  delay?: number;
}

const ScrollReveal = ({ children, className = '', delay = 0 }: Props) => {
  const ref = useRef<HTMLDivElement>(null);

  // Synchronous check so reduced-motion users never see an invisible flash.
  // window check guards SSR / test environments.
  const reducedMotion =
    typeof window !== 'undefined'
      ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
      : false;

  useEffect(() => {
    if (reducedMotion) return; // already rendered fully visible — no observer needed
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          // Hint the browser just before the transition starts, not on every mount
          el.style.willChange = 'opacity, transform, filter';
          el.style.transitionDelay = `${delay}ms`;
          el.classList.add('revealed');
          // Release the compositing layer once the transition has finished
          el.addEventListener(
            'transitionend',
            () => { el.style.willChange = 'auto'; },
            { once: true }
          );
        } else {
          el.style.transitionDelay = '0ms';
          el.classList.remove('revealed');
        }
      },
      { threshold: 0.15 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [delay, reducedMotion]);

  // Reduced motion: render immediately visible, no animation classes at all
  if (reducedMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <div
      ref={ref}
      className={`opacity-0 translate-y-5 blur-[2px] transition-[opacity,transform,filter] duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] [&.revealed]:opacity-100 [&.revealed]:translate-y-0 [&.revealed]:blur-0 ${className}`}
    >
      {children}
    </div>
  );
};

export default ScrollReveal;
