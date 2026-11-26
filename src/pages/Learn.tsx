import { useState, useEffect, useCallback, useRef } from 'react';
import PageLayout from '@/components/PageLayout';
import PixelIcon from '@/components/PixelIcon';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';
import { LINKS } from '@/config/externalLinks';
import { FREE_RESOURCES } from '@/data/learnResources';
import SkySparkles from '@/components/SkySparkles';
import PathQuiz from '@/components/PathQuiz';

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
    // Setup steps, done before any learning. Ids are appended (not renumbered)
    // because saved progress stores ids: existing checkmarks keep their meaning.
    {
        id: 8,
        name: 'Create your AWS Builder Center account',
        tag: "Free · Use the club's sign-up link",
        url: LINKS.builderCenterSignup,
    },
    {
        id: 9,
        name: 'Sign up for AWS Student Rewards',
        tag: 'Verify your student status · Unlocks a year of full Skill Builder access',
        url: LINKS.studentRewards,
    },
];

// Groups the resources into phases, in the order students should do them
const MILESTONES = [
    {
        number: '01',
        title: 'Get Set Up',
        desc: 'Before you start learning: create your free AWS Builder Center account with the club link, then sign up for AWS Student Rewards.',
        resources: [8, 9],
    },
    {
        number: '02',
        title: 'Get Oriented',
        desc: 'Understand what the exam covers and how it\'s structured before you dive in.',
        resources: [0, 1],
    },
    {
        number: '03',
        title: 'Learn the Fundamentals',
        desc: 'Official AWS training: a free 12-hour course and a game-based learning track.',
        resources: [2, 3],
    },
    {
        number: '04',
        title: 'Get Hands-On',
        desc: 'Create your AWS account and start building on real infrastructure. Console time beats theory.',
        resources: [4],
    },
    {
        number: '05',
        title: 'Prep & Practice',
        desc: 'Structured prep plan, official practice exam, and the full training hub before exam day.',
        resources: [5, 6, 7],
    },
] as const;

// Upcoming certs — displayed as locked nodes below the active path
const COMING_SOON = [
    { number: '06', title: 'AWS AI Practitioner', code: 'AIF-C01' },
    { number: '07', title: 'Solutions Architect Associate', code: 'SAA-C03' },
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
    // A native checkbox (.px-check restyles it as a pixel box): Space toggles
    // it, screen readers announce "checkbox, checked/not checked". The label
    // covers the resource name so the whole text is a click target. The
    // "Open" link sits beside the label, not inside it, so the two controls
    // never nest.
    const inputId = `ccp-resource-${resource.id}`;
    return (
        <div className={`px-row flex items-center gap-3 px-3 py-1 ${checked ? 'is-done' : ''}`}>
            <input
                id={inputId}
                type="checkbox"
                checked={checked}
                onChange={() => onToggle(resource.id)}
                className="px-check"
            />

            <label htmlFor={inputId} className="flex-1 min-w-0 py-2.5 cursor-pointer">
                <span className={`block text-[0.9375rem] font-semibold leading-snug ${checked ? 'text-success-fg' : 'text-foreground'}`}>
                    {resource.name}
                    {resource.requiresAcademy && (
                        <span className="px-chip align-middle">Academy</span>
                    )}
                </span>
                <span className="block text-[0.8125rem] text-muted-foreground mt-0.5 leading-snug">
                    {resource.tag}
                </span>
            </label>

            <a
                href={resource.url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Open ${resource.name} (opens in a new tab)`}
                className="px-option !min-h-0 !py-2 !text-sm shrink-0"
            >
                Open
                <PixelIcon name="external" size={11} className="ml-1.5" />
            </a>
        </div>
    );
}

// Level badge for a step on the path (the path really is a sequence).
function LevelBadge({ number, title, done, total }: { number: string; title: string; done: number; total: number }) {
    const complete = done === total;
    return (
        <div className="flex items-center gap-3">
            <span className={`px-date !w-12 !h-12 text-2xl ${complete ? 'text-[var(--success-fg)]' : 'text-foreground'}`} aria-hidden="true">
                {complete ? <PixelIcon name="check" size={20} /> : Number(number)}
            </span>
            <div>
                <h2 className="text-foreground" style={{ fontSize: '1.875rem' }}>
                    <span className="sr-only">Level {Number(number)}: </span>{title}
                </h2>
                <p className={`text-sm font-semibold tabular-nums ${complete ? 'text-success-fg' : 'text-muted-foreground'}`}>
                    {done}/{total}<span className="sr-only"> done</span>
                </p>
            </div>
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
// Continue where you left off
// ─────────────────────────────────────────────────────────────────────────────

/** Path order, step by step: the first resource not yet checked off. */
const PATH_ORDER: readonly number[] = MILESTONES.flatMap((m) => [...m.resources]);

function nextUnchecked(checked: number[]): Resource | null {
    const id = PATH_ORDER.find((rid) => !checked.includes(rid));
    return id === undefined ? null : CCP_RESOURCES[id];
}

function ContinueCard({ resource, started }: { resource: Resource; started: boolean }) {
    const jumpToIt = () => {
        const box = document.getElementById(`ccp-resource-${resource.id}`);
        if (!box) return;
        box.scrollIntoView({ block: 'center' });
        box.focus();
    };
    return (
        <section aria-labelledby="continue-heading" className="px-panel px-window mb-14">
            <div className="px-titlebar">
                <h2 id="continue-heading">{started ? 'Continue where you left off' : 'Start here'}</h2>
                <div className="px-winmarks" aria-hidden="true"><span /><span /><span /></div>
            </div>
            <div className="px-window-body">
                <p className="text-base text-muted-foreground">
                    Next up: <span className="text-foreground font-semibold">{resource.name}</span>
                    <span className="block text-sm mt-1">{resource.tag}</span>
                </p>
                <div className="flex flex-wrap items-center gap-x-6 gap-y-3 mt-5">
                    <a
                        href={resource.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`Open next step: ${resource.name} (opens in a new tab)`}
                        className="px-button"
                    >
                        Open it
                        <PixelIcon name="external" size={14} />
                    </a>
                    <button type="button" onClick={jumpToIt} className="px-link">
                        Jump to it in the checklist
                    </button>
                </div>
            </div>
        </section>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// Free resources (formerly the /resources page)
// ─────────────────────────────────────────────────────────────────────────────

function FreeResources() {
    return (
        <section
            id="free-resources"
            aria-labelledby="free-resources-heading"
            className="relative border-t border-border py-16"
        >
            <div className="container mx-auto px-6 max-w-3xl">
                <h2 id="free-resources-heading" className="text-foreground mb-3">
                    Free resources
                </h2>
                <p className="text-base text-muted-foreground max-w-[55ch] mb-8">
                    Accounts, training, and exam vouchers. All free for UH students.
                </p>
                <ul className="divide-y divide-border">
                    {FREE_RESOURCES.map((r) => (
                        <li key={r.title} className="py-6 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                            <div className="max-w-[55ch]">
                                <h3 className="text-foreground text-lg">
                                    {r.title}
                                    <span className="px-chip align-middle">{r.tag}</span>
                                </h3>
                                <p className="text-base text-muted-foreground leading-relaxed mt-1">{r.desc}</p>
                            </div>
                            <a
                                href={r.href}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-link whitespace-nowrap shrink-0 self-start"
                            >
                                {r.cta}
                                <PixelIcon name="external" size={12} />
                                <span className="sr-only">(opens in a new tab)</span>
                            </a>
                        </li>
                    ))}
                </ul>
            </div>
        </section>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main page
// ─────────────────────────────────────────────────────────────────────────────

export default function Learn() {
    const [checked, setChecked] = useState<number[]>([]);
    const [celebrationRun, setCelebrationRun] = useState(0);
    const [showCelebration, setShowCelebration] = useState(false);
    const prefersReducedMotion = usePrefersReducedMotion();
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
    const nextResource = nextUnchecked(checked);
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

    // Levels cleared: steps whose resources are all checked off.
    const levelsDone = MILESTONES.filter((m) => m.resources.every((id) => checked.includes(id))).length;

    return (
        <PageLayout>

            {/* ── Header ── */}
            <section className="relative overflow-hidden px-sky px-sky-high">
              <SkySparkles />
                <div className="container mx-auto px-6 pt-28 sm:pt-36 pb-12 relative max-w-3xl">
                    <h1 className="mb-5" style={{ fontSize: 'clamp(3rem, 9vw, 5rem)' }}>
                        Your path to certification.
                    </h1>
                    <p className="text-muted-foreground text-base sm:text-lg leading-relaxed max-w-[52ch]">
                        Set up your free AWS accounts, then work toward AWS Cloud
                        Practitioner. Check things off as you go; your progress is saved
                        in this browser.
                    </p>
                </div>
            </section>

            {/* ── Progress HUD + path ── */}
            <section className="relative py-12">
                <div className="container mx-auto px-6 max-w-3xl">

                    <PathQuiz />

                    {/* HUD: level and a segmented bar, one block per resource */}
                    <div id="path" className="mb-12 scroll-mt-24">
                        <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 mb-3">
                            <p className="font-pixel text-3xl text-foreground leading-none">
                                {isComplete ? 'Path complete' : `Level ${Math.min(levelsDone + 1, MILESTONES.length)} of ${MILESTONES.length}`}
                            </p>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                <span>
                                    <span className="text-foreground font-semibold">{checked.length}</span>
                                    {' / '}{CCP_RESOURCES.length} resources
                                </span>
                                <span className="text-foreground font-semibold">{progressPct}%</span>
                                {checked.length > 0 && (
                                    <button
                                        type="button"
                                        onClick={() => { setChecked([]); saveProgress([]); }}
                                        className="underline underline-offset-4 py-2"
                                    >
                                        Reset
                                    </button>
                                )}
                            </div>
                        </div>
                        <div
                            className={`px-xp ${isComplete ? 'is-complete' : ''}`}
                            role="progressbar"
                            aria-label="Learning path completion"
                            aria-valuemin={0}
                            aria-valuemax={100}
                            aria-valuenow={progressPct}
                        >
                            {CCP_RESOURCES.map((r, i) => (
                                <span key={r.id} className={i < checked.length ? 'is-on' : ''} />
                            ))}
                        </div>
                        {isComplete && (
                            <p className="mt-4 text-base text-success-fg font-semibold">
                                Path complete! Time to schedule your exam.
                            </p>
                        )}
                    </div>

                    {/* Continue where you left off (hidden once the path is complete) */}
                    {nextResource && (
                        <ContinueCard resource={nextResource} started={checked.length > 0} />
                    )}

                    {/* The path: levels in order */}
                    <ol className="space-y-14">
                        {MILESTONES.map((milestone) => (
                            <li key={milestone.number}>
                                <LevelBadge
                                    number={milestone.number}
                                    title={milestone.title}
                                    done={milestone.resources.filter((id) => checked.includes(id)).length}
                                    total={milestone.resources.length}
                                />
                                <p className="text-base text-muted-foreground mt-3 mb-5 leading-relaxed max-w-[56ch]">
                                    {milestone.desc}
                                </p>
                                <div className="flex flex-col gap-3">
                                    {milestone.resources.map((id) => (
                                        <ResourceRow
                                            key={id}
                                            resource={CCP_RESOURCES[id]}
                                            checked={checked.includes(id)}
                                            onToggle={toggleResource}
                                        />
                                    ))}
                                </div>
                            </li>
                        ))}
                    </ol>

                    {/* Locked levels: what comes after Cloud Practitioner */}
                    <div className="mt-16" aria-label="Upcoming certifications, currently locked">
                        <h2 className="text-foreground mb-2" style={{ fontSize: '1.875rem' }}>What's next</h2>
                        <p className="text-base text-muted-foreground mb-5">Paths we're building after Cloud Practitioner.</p>
                        <ul className="flex flex-col gap-3">
                            {COMING_SOON.map((cert) => (
                                <li key={cert.code} className="flex items-center gap-3 text-muted-foreground">
                                    <span className="px-chip ml-0">Locked</span>
                                    <span className="font-semibold">{cert.title}</span>
                                    <span className="text-sm">{cert.code}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* ── Bottom CTAs ── */}
                    <div className="flex flex-wrap items-center gap-x-6 gap-y-3 pt-10 mt-12 border-t border-border">
                        <a
                            href={LINKS.ccpEssentials}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-button"
                        >
                            Start on Skill Builder
                        </a>
                        <a
                            href={LINKS.ccpCertPage}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-link"
                        >
                            Schedule Exam
                            <PixelIcon name="external" size={12} />
                        </a>
                    </div>

                </div>
            </section>

            <FreeResources />

        </PageLayout>
    );
}
