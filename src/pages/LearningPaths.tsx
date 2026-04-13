import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import ScrollReveal from '@/components/ScrollReveal';
import PageLayout from '@/components/PageLayout';
import { ArrowRight } from 'lucide-react';
import { LINKS } from '@/config/externalLinks';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

interface Resource {
    id: number;
    name: string;
    tag: string;
    url: string;
    requiresAcademy?: boolean;
}

// ─────────────────────────────────────────────────────────────────────────────
// Data
// ─────────────────────────────────────────────────────────────────────────────

const CCP_RESOURCES: Resource[] = [
    {
        id: 0,
        name: 'AWS CCP Certification Page',
        tag: 'Start here · What the cert covers + exam basics',
        url: LINKS.ccpCertPage,
    },
    {
        id: 1,
        name: 'Official Exam Guide PDF (CLF-C02)',
        tag: 'Official PDF · Domains, scope, and format',
        url: LINKS.ccpExamGuide,
    },
    {
        id: 2,
        name: 'AWS Cloud Practitioner Essentials',
        tag: 'Free · ~12 hrs · Skill Builder',
        url: LINKS.ccpEssentials,
    },
    {
        id: 3,
        name: 'AWS Cloud Quest: Cloud Practitioner',
        tag: 'Game-based learning · Free · Skill Builder',
        url: LINKS.ccpCloudQuest,
    },
    {
        id: 4,
        name: 'AWS Free Tier: Create Your Account',
        tag: 'Hands-on console access · aws.amazon.com/free',
        url: LINKS.awsFreeTier,
    },
    {
        id: 5,
        name: 'Exam Prep Plan: CLF-C02',
        tag: 'Structured 4-step path · Skill Builder',
        url: LINKS.ccpExamPrepPlan,
    },
    {
        id: 6,
        name: 'Official Practice Exam (CLF-C02)',
        tag: 'Free with AWS Academy · Skill Builder',
        url: LINKS.ccpOfficialPracticeExam,
        requiresAcademy: true,
    },
    {
        id: 7,
        name: 'Cloud Practitioner Training Hub',
        tag: 'Full resource overview · AWS Training',
        url: LINKS.ccpTrainingHub,
    },
];

// Groups the 8 resources into 4 logical phases
const MILESTONES = [
    {
        number: '01',
        title: 'Get Oriented',
        desc: 'Understand what the exam covers and how it\'s structured before you dive in.',
        resources: [0, 1],
    },
    {
        number: '02',
        title: 'Learn the Fundamentals',
        desc: 'Official AWS training: a free 12-hour course and a game-based learning track.',
        resources: [2, 3],
    },
    {
        number: '03',
        title: 'Get Hands-On',
        desc: 'Create your AWS account and start building on real infrastructure. Console time beats theory.',
        resources: [4],
    },
    {
        number: '04',
        title: 'Prep & Practice',
        desc: 'Structured prep plan, official practice exam, and the full training hub before exam day.',
        resources: [5, 6, 7],
    },
] as const;

// Upcoming certs — displayed as locked nodes below the active path
const COMING_SOON = [
    { number: '05', title: 'AWS AI Practitioner', code: 'AIF-C01' },
    { number: '06', title: 'Solutions Architect Associate', code: 'SAA-C03' },
] as const;

// ─────────────────────────────────────────────────────────────────────────────
// localStorage helpers
// ─────────────────────────────────────────────────────────────────────────────

const STORAGE_KEY = 'uh_aws_cc_progress_ccp_v1';

function loadProgress(): number[] {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return [];
        const parsed = JSON.parse(raw);
        if (!Array.isArray(parsed)) return [];
        return parsed.filter(
            (n): n is number =>
                typeof n === 'number' &&
                Number.isInteger(n) &&
                n >= 0 &&
                n < CCP_RESOURCES.length,
        );
    } catch {
        return [];
    }
}

function saveProgress(checked: number[]): void {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(checked));
    } catch {
        // localStorage may be unavailable in private mode — fail silently
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────────────────────────────────────

function ResourceRow({
    resource,
    checked,
    onToggle,
}: {
    resource: Resource;
    checked: boolean;
    onToggle: (id: number) => void;
}) {
    return (
        <div
            role="button"
            tabIndex={0}
            aria-pressed={checked}
            className={`
                flex items-center gap-3 px-3 py-3 rounded-lg border
                transition-colors duration-200 cursor-pointer group
                ${checked
                    ? 'bg-success/[8%] border-success/25'
                    : 'bg-card/40 border-border hover:border-primary/50'
                }
            `}
            onClick={() => onToggle(resource.id)}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onToggle(resource.id); } }}
        >
            {/* Checkbox */}

            <div
                className={`
                    w-[17px] h-[17px] rounded-[4px] flex-shrink-0 flex items-center
                    justify-center border text-[10px] font-bold transition-all duration-200
                    ${checked
                        ? 'bg-success border-success text-white'
                        : 'border-border text-transparent group-hover:border-primary/50'
                    }
                `}
            >
                ✓
            </div>

            {/* Text */}
            <div className="flex-1 min-w-0">
                <p className={`text-[13px] font-medium leading-snug ${checked ? 'text-success-fg' : 'text-foreground'}`}>
                    {resource.name}
                    {resource.requiresAcademy && (
                        <span className="ml-2 text-[10px] font-medium text-warning bg-warning/[8%] border border-warning/25 rounded px-1.5 py-0.5 align-middle">
                            Academy
                        </span>
                    )}
                </p>
                <p className="text-[11px] text-muted-foreground mt-0.5 leading-snug">
                    {resource.tag}
                </p>
            </div>

            {/* Open link — stops propagation so click doesn't also toggle checkbox */}
            <a
                href={resource.url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="
                    flex-shrink-0 text-[11px] font-medium px-3 py-3 rounded-md
                    border border-border text-muted-foreground
                    hover:border-primary/50 hover:text-primary
                    transition-colors duration-150
                "
            >
                Open ↗
            </a>
        </div>
    );
}

// Gradient-border milestone node — inspired by KodeKloud's step markers,
// adapted to our purple/cyan brand palette.
function MilestoneNode({ number, title }: { number: string; title: string }) {
    return (
        <div
            className="inline-flex items-center gap-3 px-4 py-2 rounded-lg border border-transparent"
            style={{
                background:
                    'linear-gradient(var(--background), var(--background)) padding-box, ' +
                    'linear-gradient(135deg, var(--primary), var(--secondary)) border-box',
            }}
        >
            <span className="font-mono text-[11px] text-primary/40 shrink-0">{number}</span>
            <span className="font-heading font-semibold text-sm text-foreground">{title}</span>
        </div>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// Confetti
// ─────────────────────────────────────────────────────────────────────────────

function launchConfetti() {
    const canvas = document.createElement('canvas');
    canvas.className = 'confetti-canvas';
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    document.body.appendChild(canvas);

    const ctx = canvas.getContext('2d');
    if (!ctx) {
        canvas.remove();
        return;
    }

    const colors = [
        '#5b3ea5', '#9b7dd4', '#ff9900', '#fde68a',
        '#b8a0e3', '#7c5cbf', '#d6cce8', '#ff6b6b',
        '#48dbfb', '#fff', '#22c55e', '#86efac',
    ];

    const particles = Array.from({ length: 150 }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height - canvas.height,
        w: Math.random() * 10 + 5,
        h: Math.random() * 6 + 3,
        color: colors[Math.floor(Math.random() * colors.length)],
        vx: (Math.random() - 0.5) * 4,
        vy: Math.random() * 3 + 2,
        rot: Math.random() * 360,
        rotSpeed: (Math.random() - 0.5) * 10,
        opacity: 1,
        decay: Math.random() * 0.003 + 0.002,
    }));

    let frame = 0;

    const animate = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        let alive = false;

        for (const p of particles) {
            if (p.opacity <= 0) continue;
            alive = true;
            p.x += p.vx;
            p.y += p.vy;
            p.vy += 0.04;
            p.rot += p.rotSpeed;
            p.opacity -= p.decay;

            ctx.save();
            ctx.translate(p.x, p.y);
            ctx.rotate((p.rot * Math.PI) / 180);
            ctx.globalAlpha = Math.max(0, p.opacity);
            ctx.fillStyle = p.color;
            ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
            ctx.restore();
        }

        if (alive) {
            frame = window.requestAnimationFrame(animate);
            return;
        }

        window.cancelAnimationFrame(frame);
        canvas.remove();
    };

    animate();
}

// ─────────────────────────────────────────────────────────────────────────────
// Main page
// ─────────────────────────────────────────────────────────────────────────────

export default function LearningPaths() {
    const [checked, setChecked] = useState<number[]>([]);
    const [celebrationRun, setCelebrationRun] = useState(0);
    const [showCelebration, setShowCelebration] = useState(false);
    const prefersReducedMotion = useReducedMotion();
    const previousProgressRef = useRef(0);
    const didMountRef = useRef(false);

    useEffect(() => {
        setChecked(loadProgress());
    }, []);

    const toggleResource = useCallback((id: number) => {
        setChecked((prev) => {
            const next = prev.includes(id) ? prev.filter((n) => n !== id) : [...prev, id];
            saveProgress(next);
            return next;
        });
    }, []);

    const progressPct = Math.round((checked.length / CCP_RESOURCES.length) * 100);
    const isComplete = progressPct === 100;

    useEffect(() => {
        const previousProgress = previousProgressRef.current;

        if (didMountRef.current && isComplete && previousProgress < 100) {
            setCelebrationRun((c) => c + 1);
            setShowCelebration(true);

            if (!prefersReducedMotion) {
                const id = window.setTimeout(() => setShowCelebration(false), 1800);
                previousProgressRef.current = progressPct;
                return () => window.clearTimeout(id);
            }
        }

        if (!isComplete) setShowCelebration(false);

        didMountRef.current = true;
        previousProgressRef.current = progressPct;
    }, [progressPct, prefersReducedMotion, isComplete]);

    useEffect(() => {
        if (!showCelebration || prefersReducedMotion) return;
        launchConfetti();
    }, [showCelebration, prefersReducedMotion, celebrationRun]);

    return (
        <PageLayout intensity="low">

            {/* ── Header ── */}
            <section className="relative z-10 min-h-[40vh] flex flex-col justify-end py-16 border-b border-border">
                <div className="container mx-auto px-6">
                    <ScrollReveal>
                        <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground mb-4">
                            Learning paths
                        </p>
                        <h1
                            className="font-heading font-extrabold leading-[0.88] tracking-tight text-foreground mb-6"
                            style={{ fontSize: 'clamp(2.5rem, 6vw, 4.5rem)' }}
                        >
                            Your path to<br />
                            <span style={{ color: 'var(--primary)' }}>certification.</span>
                        </h1>
                        <p className="text-muted-foreground text-base leading-relaxed max-w-[50ch]">
                            AWS Cloud Practitioner is your entry point. Follow the path,
                            check things off, get certified.
                        </p>
                    </ScrollReveal>
                </div>
            </section>

            {/* ── Roadmap ── */}
            <section className="relative z-10 py-16">
                <div className="container mx-auto px-6 max-w-3xl">

                    {/* Progress bar */}
                    <ScrollReveal>
                        <div className="mb-12 pb-8 border-b border-border">
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-3 text-[12px] text-muted-foreground">
                                    <span>
                                        <span className="text-primary font-medium">{checked.length}</span>
                                        {' / '}{CCP_RESOURCES.length} resources
                                    </span>
                                    <span className="text-primary font-medium">{progressPct}%</span>
                                </div>
                                {checked.length > 0 && (
                                    <button
                                        onClick={() => { setChecked([]); saveProgress([]); }}
                                        className="text-[11px] text-muted-foreground/60 hover:text-muted-foreground transition-colors"
                                    >
                                        Reset
                                    </button>
                                )}
                            </div>
                            <motion.div
                                className={`relative h-1.5 rounded-full overflow-hidden ${isComplete
                                    ? 'bg-success/[12%]'
                                    : 'bg-muted'
                                    }`}
                                role="progressbar"
                                aria-label="Learning path completion"
                                aria-valuemin={0}
                                aria-valuemax={100}
                                aria-valuenow={progressPct}
                                animate={
                                    isComplete && !prefersReducedMotion
                                        ? {
                                            boxShadow: [
                                                '0 0 18px rgba(16,185,129,0.25)',
                                                '0 0 28px rgba(16,185,129,0.40)',
                                                '0 0 18px rgba(16,185,129,0.25)',
                                            ],
                                        }
                                        : undefined
                                }
                                transition={
                                    isComplete && !prefersReducedMotion
                                        ? { duration: 1.4, repeat: Infinity, ease: 'easeInOut' }
                                        : { duration: 0.4, ease: 'easeOut' }
                                }
                            >
                                <motion.div
                                    className={`absolute inset-y-0 left-0 rounded-full ${isComplete ? 'bg-success-fg' : 'bg-success'}`}
                                    animate={{ width: `${progressPct}%` }}
                                    transition={{ duration: 0.45, ease: 'easeOut' }}
                                />
                            </motion.div>

                            {/* Completion message */}
                            {isComplete && (
                                <motion.p
                                    className="mt-3 text-[13px] text-success-fg font-medium"
                                    initial={{ opacity: 0, y: 4 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.35 }}
                                >
                                    Path complete! Time to schedule your exam. 🎉
                                </motion.p>
                            )}
                        </div>
                    </ScrollReveal>

                    {/* Vertical roadmap */}
                    <div className="relative">

                        {/* Spine — purple fading to cyan, fades out before coming-soon nodes */}
                        <div
                            className="absolute left-3 top-4 w-px"
                            style={{
                                bottom: '160px',
                                background:
                                    'linear-gradient(to bottom, var(--primary) 0%, var(--secondary) 75%, transparent 100%)',
                            }}
                        />

                        {/* Active milestones */}
                        {MILESTONES.map((milestone, mi) => (
                            <ScrollReveal key={milestone.number} delay={mi * 70}>
                                <div className="relative pl-12 mb-12">

                                    {/* Spine dot */}
                                    <div className="absolute left-[9px] top-[10px] w-[7px] h-[7px] rounded-full bg-primary ring-[3px] ring-background" />

                                    {/* Milestone node */}
                                    <div className="mb-4">
                                        <MilestoneNode number={milestone.number} title={milestone.title} />
                                    </div>

                                    <p className="text-[13px] text-muted-foreground mb-4 leading-relaxed max-w-[52ch]">
                                        {milestone.desc}
                                    </p>

                                    {/* Resources */}
                                    <div className="flex flex-col gap-2">
                                        {milestone.resources.map((id) => (
                                            <ResourceRow
                                                key={id}
                                                resource={CCP_RESOURCES[id]}
                                                checked={checked.includes(id)}
                                                onToggle={toggleResource}
                                            />
                                        ))}
                                    </div>
                                </div>
                            </ScrollReveal>
                        ))}

                        {/* Coming soon — locked milestones fade out below the spine */}
                        <ScrollReveal delay={280}>
                            <div className="relative pl-12 mb-6 pt-2" aria-label="Upcoming certifications, currently locked">
                                <p className="text-[11px] font-medium tracking-widest text-primary/50 uppercase mb-5">
                                    What's next
                                </p>
                                <div className="flex flex-col gap-3">
                                    {COMING_SOON.map((cert, ci) => (
                                        <div
                                            key={cert.code}
                                            className="flex items-center gap-3"
                                            style={{ opacity: 0.35 - ci * 0.08 }}
                                        >
                                            {/* Dotted milestone node */}
                                            <div
                                                className="inline-flex items-center gap-3 px-4 py-2 rounded-lg border border-dashed border-border"
                                            >
                                                <span className="font-mono text-[11px] text-muted-foreground/40">{cert.number}</span>
                                                <span className="font-heading font-medium text-sm text-muted-foreground/50">{cert.title}</span>
                                                <span className="text-[10px] uppercase tracking-wider text-muted-foreground/30 ml-1">
                                                    Locked
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </ScrollReveal>
                    </div>

                    {/* ── Bottom CTAs ── */}
                    <ScrollReveal delay={320}>
                        <div className="flex flex-wrap gap-3 pt-10 mt-6 border-t border-border">
                            <a
                                href={LINKS.ccpEssentials}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 px-5 py-2.5 rounded bg-primary text-primary-foreground font-semibold text-sm transition-all duration-150 hover:opacity-90 active:scale-[0.98]"
                            >
                                Start on Skill Builder
                                <ArrowRight className="w-4 h-4" />
                            </a>
                            <a
                                href={LINKS.ccpCertPage}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 px-5 py-2.5 rounded border border-primary/40 text-primary font-semibold text-sm transition-all duration-150 hover:bg-primary/10 active:scale-[0.98]"
                            >
                                Schedule Exam
                            </a>
                        </div>
                    </ScrollReveal>

                </div>
            </section>

        </PageLayout>
    );
}
