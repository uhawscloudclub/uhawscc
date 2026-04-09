import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import ScrollReveal from '@/components/ScrollReveal';
import PageLayout from '@/components/PageLayout';
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

interface Cert {
    code: string;
    label: string;
    status: 'active' | 'locked';
    badgeSrc: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Data — swap a URL in LINKS (src/config/externalLinks.ts) to update sitewide.
// Swap a resource name/tag here to update display text only.
// ─────────────────────────────────────────────────────────────────────────────

const CERT_PATH: Cert[] = [
    {
        code: 'CCP',
        label: 'Cloud Practitioner',
        status: 'active',
        badgeSrc: '/certifications/cloud-practitioner-badge.png',
    },
    {
        code: 'AIF-C01',
        label: 'AI Practitioner',
        status: 'locked',
        badgeSrc: '/certifications/ai-practitioner-badge.png',
    },
    {
        code: 'SAA-C03',
        label: 'Solutions Architect',
        status: 'locked',
        badgeSrc: '/certifications/solutions-architect-associate-badge.png',
    },
];

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
        name: 'AWS Free Tier — Create Your Account',
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

// ─────────────────────────────────────────────────────────────────────────────
// localStorage helpers — namespaced key, numbers only, no PII ever stored.
// v1 suffix allows clean migration if the resource list ever changes shape.
// ─────────────────────────────────────────────────────────────────────────────

const STORAGE_KEY = 'uh_aws_cc_progress_ccp_v1';

function loadProgress(): number[] {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return [];
        const parsed = JSON.parse(raw);
        if (!Array.isArray(parsed)) return [];
        // Validate: only accept valid resource IDs (numbers within range)
        return parsed.filter(
            (n): n is number =>
                typeof n === 'number' &&
                Number.isInteger(n) &&
                n >= 0 &&
                n < CCP_RESOURCES.length
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

function RoadmapNode({ cert, index }: { cert: Cert; index: number }) {
    const [imageFailed, setImageFailed] = useState(false);
    const isActive = cert.status === 'active';

    return (
        <motion.div
            className="flex flex-col items-center gap-2 min-w-[110px]"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.15, duration: 0.4 }}
        >
            <div
                className={`
          w-20 h-20 sm:w-24 sm:h-24 rounded-full flex items-center justify-center overflow-hidden border-2
          ${isActive
                        ? 'bg-[#1e1b4b] border-[color:var(--primary)] text-[#a78bfa]'
                        : 'bg-[#0f172a] border-[#1e293b] text-[#475569]'
                    }
        `}
            >
                {imageFailed ? (
                    <span className="text-xs font-semibold">{cert.code}</span>
                ) : (
                    <img
                        src={cert.badgeSrc}
                        alt={`${cert.label} certification badge`}
                        className={`w-full h-full object-contain p-1.5 ${isActive ? '' : 'grayscale opacity-60'}`}
                        onError={() => setImageFailed(true)}
                    />
                )}
            </div>
            <span
                className={`text-[13px] sm:text-sm font-medium text-center max-w-[110px] ${isActive ? 'text-[#c4b5fd]' : 'text-[#475569]'
                    }`}
            >
                {cert.label}
            </span>
        </motion.div>
    );
}

function RoadmapConnector({ locked }: { locked: boolean }) {
    return (
        <div
            className={`
        flex-1 min-w-[28px] max-w-[72px] h-[3px] mb-10 rounded-full
        ${locked ? 'bg-[#1e293b]' : 'bg-[color:var(--primary)]'}
      `}
        />
    );
}

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
        <motion.div
            layout
            className={`
        flex items-center gap-3 px-3 py-3 rounded-lg border
        transition-colors duration-200 cursor-pointer group
        ${checked
                    ? 'bg-[#031a0f] border-emerald-700'
                    : 'bg-[#0f172a] border-[#1e293b] hover:border-[color:var(--primary)]'
                }
      `}
            onClick={() => onToggle(resource.id)}
        >
            {/* Checkbox */}
            <div
                className={`
          w-[18px] h-[18px] rounded-[4px] flex-shrink-0 flex items-center
          justify-center border text-[10px] font-bold transition-all duration-200
          ${checked
                        ? 'bg-emerald-600 border-emerald-600 text-white'
                        : 'border-[#374151] text-transparent group-hover:border-[color:var(--primary)]'
                    }
        `}
            >
                ✓
            </div>

            {/* Text */}
            <div className="flex-1 min-w-0">
                <p
                    className={`text-[13px] font-medium leading-snug ${checked ? 'text-emerald-400' : 'text-slate-300'
                        }`}
                >
                    {resource.name}
                    {resource.requiresAcademy && (
                        <span className="ml-2 text-[10px] font-medium text-amber-500 bg-amber-950 border border-amber-800 rounded px-1.5 py-0.5 align-middle">
                            Academy
                        </span>
                    )}
                </p>
                <p className="text-[11px] text-slate-600 mt-0.5">{resource.tag}</p>
            </div>

            {/* Open button — stops propagation so click doesn't also toggle checkbox */}
            <a
                href={resource.url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="
          flex-shrink-0 text-[11px] font-medium px-2.5 py-1.5 rounded-md
          border border-[#374151] text-slate-400
                    hover:border-[color:var(--primary)] hover:text-[#a78bfa]
          transition-colors duration-150
        "
            >
                Open ↗
            </a>
        </motion.div>
    );
}

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
        '#5b3ea5',
        '#9b7dd4',
        '#ff9900',
        '#fde68a',
        '#b8a0e3',
        '#7c5cbf',
        '#d6cce8',
        '#ff6b6b',
        '#48dbfb',
        '#fff',
        '#22c55e',
        '#86efac',
    ];
    const particles = [] as Array<{
        x: number;
        y: number;
        w: number;
        h: number;
        color: string;
        vx: number;
        vy: number;
        rot: number;
        rotSpeed: number;
        opacity: number;
        decay: number;
    }>;
    const count = 150;

    for (let index = 0; index < count; index += 1) {
        particles.push({
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
        });
    }

    let frame = 0;

    const animate = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        let alive = false;

        particles.forEach((particle) => {
            if (particle.opacity <= 0) {
                return;
            }

            alive = true;
            particle.x += particle.vx;
            particle.y += particle.vy;
            particle.vy += 0.04;
            particle.rot += particle.rotSpeed;
            particle.opacity -= particle.decay;

            ctx.save();
            ctx.translate(particle.x, particle.y);
            ctx.rotate((particle.rot * Math.PI) / 180);
            ctx.globalAlpha = Math.max(0, particle.opacity);
            ctx.fillStyle = particle.color;
            ctx.fillRect(-particle.w / 2, -particle.h / 2, particle.w, particle.h);
            ctx.restore();
        });

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

export default function Resources() {
    const [checked, setChecked] = useState<number[]>([]);
    const [celebrationRun, setCelebrationRun] = useState(0);
    const [showCelebration, setShowCelebration] = useState(false);
    const prefersReducedMotion = useReducedMotion();
    const previousProgressRef = useRef(0);
    const didMountRef = useRef(false);

    // Load from localStorage on mount
    useEffect(() => {
        setChecked(loadProgress());
    }, []);

    const toggleResource = useCallback((id: number) => {
        setChecked((prev) => {
            const next = prev.includes(id)
                ? prev.filter((n) => n !== id)
                : [...prev, id];
            saveProgress(next);
            return next;
        });
    }, []);

    const progressPct = Math.round((checked.length / CCP_RESOURCES.length) * 100);
    const isComplete = progressPct === 100;

    useEffect(() => {
        const previousProgress = previousProgressRef.current;

        if (didMountRef.current && isComplete && previousProgress < 100) {
            setCelebrationRun((current) => current + 1);
            setShowCelebration(true);

            if (!prefersReducedMotion) {
                const timeoutId = window.setTimeout(() => {
                    setShowCelebration(false);
                }, 1800);

                previousProgressRef.current = progressPct;
                return () => window.clearTimeout(timeoutId);
            }
        }

        if (!isComplete) {
            setShowCelebration(false);
        }

        didMountRef.current = true;
        previousProgressRef.current = progressPct;
    }, [progressPct, prefersReducedMotion, isComplete]);

    useEffect(() => {
        if (!showCelebration || prefersReducedMotion) {
            return;
        }

        launchConfetti();
    }, [showCelebration, prefersReducedMotion, celebrationRun]);

    return (
        <PageLayout>
            <section className="py-24">
                <div className="container mx-auto px-6 max-w-4xl">

                    {/* ── Page header ── */}
                    <ScrollReveal>
                        <div className="mb-10">
                            <h1 className="font-heading font-bold text-4xl md:text-5xl text-foreground mb-3">
                                Your <span className="text-gradient">Cloud Path</span>
                            </h1>
                            <p className="text-slate-400 text-base leading-relaxed">
                                Everything you need to go from zero to AWS certified — curated,
                                ordered, and trackable. Check off resources as you complete them.
                            </p>
                        </div>
                    </ScrollReveal>

                    {/* ── Certification roadmap ── */}
                    <ScrollReveal>
                        <div className="glass-card rounded-xl p-5 mb-8">
                            <p className="text-[11px] font-medium tracking-widest text-[color:var(--primary)] uppercase mb-4">
                                Certification Path
                            </p>
                            <div className="flex items-center justify-center">
                                {CERT_PATH.map((cert, i) => (
                                    <div key={cert.code} className="flex items-center">
                                        <RoadmapNode cert={cert} index={i} />
                                        {i < CERT_PATH.length - 1 && (
                                            <RoadmapConnector locked={CERT_PATH[i + 1].status === 'locked'} />
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </ScrollReveal>

                    {/* ── CCP deep-dive ── */}
                    <ScrollReveal>
                        <div className="glass-card rounded-xl p-5 mb-6 border border-[color:var(--primary)]/40">

                            {/* Header */}
                            <div className="flex items-center gap-3 mb-3">
                                <span className="text-[11px] font-medium px-2.5 py-1 rounded-md bg-[#1e1b4b] border border-[color:var(--primary)] text-[#a78bfa]">
                                    CLF-C02
                                </span>
                                <h2 className="text-[17px] font-semibold text-white">
                                    AWS Cloud Practitioner
                                </h2>
                                <span className="ml-auto text-[11px] font-medium px-2 py-0.5 rounded-full bg-emerald-950 border border-emerald-800 text-emerald-400">
                                    Active
                                </span>
                            </div>

                            <p className="text-[13px] text-slate-500 leading-relaxed mb-4">
                                Your entry point into AWS. Covers cloud concepts, core services,
                                security, pricing, and the Well-Architected Framework. No prior
                                experience required.
                            </p>

                            {/* Progress */}
                            <div className="flex items-center gap-3 mb-2">
                                <div className="flex items-center gap-2 text-[12px] text-slate-500">
                                    <span className="text-[color:var(--primary)] font-medium">
                                        {progressPct}%
                                    </span>
                                    complete
                                </div>
                                <div className="text-[12px] text-slate-500">
                                    <span className="text-[color:var(--primary)] font-medium">
                                        {checked.length}
                                    </span>
                                    {' / '}
                                    {CCP_RESOURCES.length} resources
                                </div>
                                {checked.length > 0 && (
                                    <button
                                        onClick={() => {
                                            setChecked([]);
                                            saveProgress([]);
                                        }}
                                        className="ml-auto text-[11px] text-slate-600 hover:text-slate-400 transition-colors"
                                    >
                                        Reset
                                    </button>
                                )}
                            </div>

                            {/* Progress bar */}
                            <div className="relative mb-5">
                                <motion.div
                                    className={`relative h-1.5 rounded-full overflow-hidden ${isComplete
                                        ? 'bg-emerald-950/80 shadow-[0_0_20px_rgba(16,185,129,0.35),0_0_46px_rgba(52,211,153,0.12)]'
                                        : 'bg-[#1e293b]'
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
                                                    '0 0 18px rgba(16,185,129,0.28), 0 0 34px rgba(34,197,94,0.08)',
                                                    '0 0 26px rgba(16,185,129,0.42), 0 0 52px rgba(74,222,128,0.18)',
                                                    '0 0 20px rgba(16,185,129,0.32), 0 0 40px rgba(34,197,94,0.1)',
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
                                        className={`absolute inset-y-0 left-0 rounded-full bg-gradient-to-r ${isComplete
                                            ? 'from-emerald-400 via-emerald-300 to-lime-300'
                                            : 'from-emerald-600 via-emerald-500 to-lime-400'
                                            }`}
                                        animate={{ width: `${progressPct}%` }}
                                        transition={{ duration: 0.45, ease: 'easeOut' }}
                                    />
                                    <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,0.18)_0%,rgba(255,255,255,0.02)_30%,rgba(255,255,255,0.06)_70%,rgba(255,255,255,0.14)_100%)] opacity-70" />
                                </motion.div>
                            </div>

                            {/* Resource list */}
                            <p className="text-[11px] font-medium tracking-widest text-[color:var(--primary)] uppercase mb-3">
                                Learning Resources
                            </p>
                            <p className="text-[12px] text-slate-400 mb-3 leading-relaxed">
                                <a
                                    href={LINKS.skillBuilderHome}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-[color:var(--secondary)] hover:underline"
                                >
                                    What is Skill Builder?
                                </a>{' '}
                                AWS Skill Builder is AWS's official training platform. It includes free courses,
                                and full subscription features are normally paid.
                            </p>
                            <div className="flex flex-col gap-2 mb-5">
                                {CCP_RESOURCES.map((r) => (
                                    <ResourceRow
                                        key={r.id}
                                        resource={r}
                                        checked={checked.includes(r.id)}
                                        onToggle={toggleResource}
                                    />
                                ))}
                            </div>

                            {/* CTAs */}
                            <div className="flex flex-wrap gap-3">
                                <a
                                    href={LINKS.ccpEssentials}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="px-4 py-2 rounded-lg bg-[color:var(--primary)] text-white text-[13px] font-medium hover:opacity-90 transition-opacity"
                                >
                                    Start on Skill Builder
                                </a>
                                <a
                                    href={LINKS.ccpCertPage}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="px-4 py-2 rounded-lg border border-[color:var(--primary)] text-[color:var(--primary)] text-[13px] font-medium hover:bg-[color:var(--primary)]/10 transition-colors"
                                >
                                    Schedule Exam
                                </a>
                            </div>
                        </div>
                    </ScrollReveal>

                    {/* ── Voucher section ── */}
                    <ScrollReveal>
                        <p className="text-[11px] font-medium tracking-widest text-[color:var(--primary)] uppercase mb-3">
                            Free Certification Vouchers
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">

                            {/* Card A — No Academy access yet */}
                            <div className="glass-card rounded-xl p-5 border border-[#1e293b]">
                                <span className="inline-block text-[11px] font-medium px-2.5 py-1 rounded-md bg-emerald-950 border border-emerald-800 text-emerald-400 mb-3">
                                    Up to 4 free cert vouchers
                                </span>
                                <h3 className="text-[15px] font-semibold text-white mb-2">
                                    Get AWS Academy Access
                                </h3>
                                <p className="text-[13px] text-slate-500 leading-relaxed mb-4">
                                    UH students can get a free 1-year Skill Builder subscription and
                                    100% discounted exam vouchers through AWS Academy. Fill out the
                                    form and we will get you access through the CIS department.
                                </p>
                                <a
                                    href={LINKS.awsAcademySignupForm}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="block w-full text-center px-4 py-2.5 rounded-lg bg-emerald-600 text-white text-[13px] font-medium hover:bg-emerald-500 transition-colors"
                                >
                                    Request Access
                                </a>
                            </div>

                            {/* Card B — Already have Academy access */}
                            <div className="glass-card rounded-xl p-5 border border-[color:var(--secondary)]/40">
                                <span className="inline-block text-[11px] font-medium px-2.5 py-1 rounded-md bg-sky-950 border border-sky-700 text-sky-400 mb-3">
                                    5-step setup guide
                                </span>
                                <h3 className="text-[15px] font-semibold text-white mb-2">
                                    Already Have AWS Academy?
                                </h3>
                                <p className="text-[13px] text-slate-500 leading-relaxed mb-4">
                                    Follow our step-by-step guide to activate your free Skill Builder
                                    subscription through Canvas and claim your certification vouchers
                                    via Pearson Vue.
                                </p>
                                <div className="flex gap-2">
                                    <a
                                        href={LINKS.skillBuilderSetupGuide}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex-1 text-center px-3 py-2.5 rounded-lg border border-sky-700 text-sky-400 text-[13px] font-medium hover:bg-sky-950 transition-colors"
                                    >
                                        View Guide
                                    </a>
                                    <a
                                        href={LINKS.skillBuilderSetupGuide}
                                        download="AWS-Skill-Builder-Setup-Guide.pdf"
                                        className="flex-1 text-center px-3 py-2.5 rounded-lg bg-sky-700 text-white text-[13px] font-medium hover:bg-sky-600 transition-colors"
                                    >
                                        Download PDF
                                    </a>
                                </div>
                            </div>
                        </div>
                    </ScrollReveal>

                    {/* ── Coming soon certs ── */}
                    <ScrollReveal>
                        <p className="text-[11px] font-medium tracking-widest text-[color:var(--primary)] uppercase mb-3">
                            Coming Soon
                        </p>
                        <div className="flex flex-col gap-3">
                            {[
                                {
                                    code: 'AIF-C01',
                                    title: 'AWS AI Practitioner',
                                    desc: 'Unlocks after CCP. Covers AI/ML concepts, Amazon Bedrock, Responsible AI, and generative AI on AWS.',
                                },
                                {
                                    code: 'SAA-C03',
                                    title: 'AWS Solutions Architect Associate',
                                    desc: 'Design resilient, high-performing, secure AWS architectures. The architect-level certification.',
                                },
                            ].map((cert) => (
                                <div
                                    key={cert.code}
                                    className="rounded-xl p-5 border border-dashed border-[#1e293b] bg-transparent opacity-50"
                                >
                                    <div className="flex items-center gap-3 mb-1">
                                        <span className="text-[11px] font-medium px-2.5 py-1 rounded-md bg-[#0f172a] border border-[#1e293b] text-[#374151]">
                                            {cert.code} · Locked
                                        </span>
                                        <h3 className="text-[15px] font-semibold text-[#374151]">
                                            {cert.title}
                                        </h3>
                                    </div>
                                    <p className="text-[13px] text-[#374151] leading-relaxed">
                                        {cert.desc}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </ScrollReveal>
                </div>
            </section>
        </PageLayout>
    );
}
