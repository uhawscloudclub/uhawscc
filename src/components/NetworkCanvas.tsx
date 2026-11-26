import { useEffect, useRef } from 'react';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';

interface Node {
    x: number;
    y: number;
    vx: number;
    vy: number;
    radius: number;
    opacity: number;
    isPurple: boolean;
}

type Intensity = 'low' | 'medium' | 'high';

const INTENSITY_PRESETS: Record<
    Intensity,
    {
        maxDist: number;
        nodeCount: number;
        speed: number;
        edgeAlpha: number;
        lineWidth: number;
        nodeMinOpacity: number;
        nodeOpacityRange: number;
        nodeRadiusBase: number;
        nodeRadiusRange: number;
        shadowBlur: number;
        canvasOpacity: number;
    }
> = {
    low: {
        maxDist: 165,
        nodeCount: 44,
        speed: 0.2,
        edgeAlpha: 0.45,
        lineWidth: 0.9,
        nodeMinOpacity: 0.4,
        nodeOpacityRange: 0.35,
        nodeRadiusBase: 1,
        nodeRadiusRange: 1,
        shadowBlur: 4,
        canvasOpacity: 0.7,
    },
    medium: {
        maxDist: 190,
        nodeCount: 58,
        speed: 0.26,
        edgeAlpha: 0.65,
        lineWidth: 1.05,
        nodeMinOpacity: 0.5,
        nodeOpacityRange: 0.4,
        nodeRadiusBase: 1.2,
        nodeRadiusRange: 1.3,
        shadowBlur: 6,
        canvasOpacity: 0.85,
    },
    high: {
        maxDist: 215,
        nodeCount: 72,
        speed: 0.32,
        edgeAlpha: 0.9,
        lineWidth: 1.25,
        nodeMinOpacity: 0.62,
        nodeOpacityRange: 0.38,
        nodeRadiusBase: 1.5,
        nodeRadiusRange: 2,
        shadowBlur: 8,
        canvasOpacity: 1,
    },
};

// Dual palette: violet-purple + cyan — matches brand tokens
const PURPLE = { r: 178, g: 138, b: 255 } as const;
const CYAN   = { r: 72,  g: 212, b: 242 } as const;

/**
 * Decorative background. With prefers-reduced-motion it draws one static frame
 * and never animates; there is deliberately no prop to override that. The
 * preference is read live, so toggling it while the page is open takes effect.
 */
export default function NetworkCanvas({
    intensity = 'medium',
}: {
    intensity?: Intensity;
}) {
    const prefersReducedMotion = usePrefersReducedMotion();
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const frameRef = useRef<number>(0);
    const nodesRef = useRef<Node[]>([]);
    const sizeRef = useRef({ width: 0, height: 0 });

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const preset = INTENSITY_PRESETS[intensity];
        const dpr = window.devicePixelRatio || 1;

        // Disable expensive shadowBlur on mobile — shadow forces software rasterization
        const disableShadow = window.innerWidth < 768;

        const resize = () => {
            const width = window.innerWidth;
            const height = window.innerHeight;
            sizeRef.current = { width, height };
            canvas.width = Math.round(width * dpr);
            canvas.height = Math.round(height * dpr);
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        };

        const init = () => {
            resize();
            // Halve node count on mobile — O(n²) edge loop is expensive on low-end CPUs
            const isMobile = window.innerWidth < 768;
            const nodeCount = isMobile ? Math.min(preset.nodeCount, 28) : preset.nodeCount;
            nodesRef.current = Array.from({ length: nodeCount }, () => ({
                x: Math.random() * sizeRef.current.width,
                y: Math.random() * sizeRef.current.height,
                vx: (Math.random() - 0.5) * preset.speed,
                vy: (Math.random() - 0.5) * preset.speed,
                radius: Math.random() * preset.nodeRadiusRange + preset.nodeRadiusBase,
                opacity: Math.random() * preset.nodeOpacityRange + preset.nodeMinOpacity,
                // ~62% purple, ~38% cyan — purple stays dominant (brand primary)
                isPurple: Math.random() > 0.38,
            }));
        };

        const draw = () => {
            const { width, height } = sizeRef.current;
            ctx.clearRect(0, 0, width, height);
            const nodes = nodesRef.current;

            if (!prefersReducedMotion) {
                for (const n of nodes) {
                    n.x += n.vx;
                    n.y += n.vy;
                    if (n.x < 0 || n.x > width) n.vx *= -1;
                    if (n.y < 0 || n.y > height) n.vy *= -1;
                }
            }

            for (let i = 0; i < nodes.length; i++) {
                for (let j = i + 1; j < nodes.length; j++) {
                    const dx = nodes[i].x - nodes[j].x;
                    const dy = nodes[i].y - nodes[j].y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist > preset.maxDist) continue;

                    const alpha = (1 - dist / preset.maxDist) * preset.edgeAlpha;
                    // Blend the two endpoint colors — pure purple line, pure cyan line, or mid-mix
                    const ci = nodes[i].isPurple ? PURPLE : CYAN;
                    const cj = nodes[j].isPurple ? PURPLE : CYAN;
                    const lr = Math.round((ci.r + cj.r) / 2);
                    const lg = Math.round((ci.g + cj.g) / 2);
                    const lb = Math.round((ci.b + cj.b) / 2);
                    ctx.beginPath();
                    ctx.moveTo(nodes[i].x, nodes[i].y);
                    ctx.lineTo(nodes[j].x, nodes[j].y);
                    ctx.strokeStyle = `rgba(${lr},${lg},${lb},${alpha.toFixed(3)})`;
                    ctx.lineWidth = preset.lineWidth;
                    ctx.stroke();
                }
            }

            for (const n of nodes) {
                const c = n.isPurple ? PURPLE : CYAN;
                ctx.beginPath();
                ctx.arc(n.x, n.y, n.radius, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(${c.r},${c.g},${c.b},${n.opacity.toFixed(3)})`;
                // Only apply shadow on larger nodes (>1.8px) and not on mobile
                if (!disableShadow && n.radius > 1.8) {
                    ctx.shadowColor = `rgba(${c.r},${c.g},${c.b},0.55)`;
                    ctx.shadowBlur = preset.shadowBlur;
                } else {
                    ctx.shadowBlur = 0;
                }
                ctx.fill();
            }

            ctx.shadowBlur = 0;
            if (!prefersReducedMotion) {
                frameRef.current = requestAnimationFrame(draw);
            }
        };

        const handleResize = () => {
            resize();
            if (prefersReducedMotion) {
                draw();
            }
        };

        const startCanvas = () => {
            init();
            draw();
            window.addEventListener('resize', handleResize);
        };

        // Defer canvas start until the browser is idle so the RAF loop doesn't
        // compete with React's initial render. requestIdleCallback fires after
        // first paint; setTimeout(250) is the Safari fallback.
        const idleId =
            typeof requestIdleCallback !== 'undefined'
                ? requestIdleCallback(startCanvas, { timeout: 2000 })
                : setTimeout(startCanvas, 250);

        return () => {
            if (typeof requestIdleCallback !== 'undefined') {
                cancelIdleCallback(idleId as number);
            } else {
                clearTimeout(idleId as number);
            }
            cancelAnimationFrame(frameRef.current);
            window.removeEventListener('resize', handleResize);
        };
    }, [intensity, prefersReducedMotion]);

    return (
        <canvas
            ref={canvasRef}
            className="fixed inset-0 w-full h-full pointer-events-none z-[1]"
            style={{ opacity: INTENSITY_PRESETS[intensity].canvasOpacity }}
            aria-hidden="true"
        />
    );
}
