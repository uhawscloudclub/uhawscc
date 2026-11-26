import { useEffect, useRef, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { Turnstile, type TurnstileInstance } from '@marsidev/react-turnstile';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import PageLayout from '@/components/PageLayout';
import ScrollReveal from '@/components/ScrollReveal';
import { Link } from 'react-router-dom';
import { ArrowRight, Mail, MessageSquare, CheckCircle2, AlertCircle } from 'lucide-react';
import { Linkedin, Instagram } from 'lucide-react';
import { EXTERNAL_LINKS } from '@/config/externalLinks';
import { INTENTS, LIMITS, buildSubject, type IntentId } from '@/lib/contactForm';

// ── Discord icon (not in lucide) ─────────────────────────────────────────────
const DiscordIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057c.001.025.015.047.035.063a19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
  </svg>
);

// ── Form schema ───────────────────────────────────────────────────────────────
// Limits come from LIMITS (src/lib/contactForm.ts), which mirror server.js.
const schema = z.object({
  name: z.string().trim()
    .min(2, 'Enter your name (at least 2 characters).')
    .max(LIMITS.name, `Name must be ${LIMITS.name} characters or fewer.`),
  email: z.string().trim()
    .max(LIMITS.email, `Email must be ${LIMITS.email} characters or fewer.`)
    .email('Enter an email address like name@cougarnet.uh.edu.'),
  subject: z.string().trim()
    .max(LIMITS.subject, `Subject must be ${LIMITS.subject} characters or fewer.`)
    .optional(),
  message: z.string().trim()
    .min(10, 'Write at least 10 characters so we can help.')
    .max(LIMITS.message, `Message must be ${LIMITS.message.toLocaleString('en-US')} characters or fewer.`),
});

type FormValues = z.infer<typeof schema>;

// ── Reach-out channels ────────────────────────────────────────────────────────
const channels = [
  {
    icon: Mail,
    label: 'Email us directly',
    value: EXTERNAL_LINKS.emailContact,
    href: `mailto:${EXTERNAL_LINKS.emailContact}`,
  },
  {
    icon: DiscordIcon,
    label: 'Join our Discord',
    value: 'discord.gg/8eABTmM8mT',
    href: EXTERNAL_LINKS.discord,
  },
  {
    icon: Linkedin,
    label: 'Connect on LinkedIn',
    value: 'linkedin.com/company/aws-student-builder-group-uh',
    href: EXTERNAL_LINKS.linkedin,
  },
  {
    icon: Instagram,
    label: 'Follow on Instagram',
    value: '@awssbg_uh',
    href: EXTERNAL_LINKS.instagram,
  },
];

// ── Field component ───────────────────────────────────────────────────────────
// The error message gets an id that the input references via
// aria-describedby, so a screen reader reads it when the field gets focus
// (react-hook-form focuses the first invalid field on submit).
const Field = ({
  label, id, required, error, children,
}: {
  label: string;
  id: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
}) => (
  <div className="flex flex-col gap-1.5">
    <label
      htmlFor={id}
      className="text-xs uppercase tracking-[0.12em] text-muted-foreground font-medium"
    >
      {label}{required && <span className="text-primary ml-0.5" aria-hidden="true">*</span>}
      {required && <span className="sr-only">(required)</span>}
    </label>
    {children}
    {error && (
      <p id={`${id}-error`} className="text-xs text-destructive flex items-center gap-1 mt-0.5">
        <AlertCircle className="w-3 h-3 shrink-0" aria-hidden="true" />
        {error}
      </p>
    )}
  </div>
);

/** aria props for an input: invalid state plus error/hint descriptions. */
function describe(id: string, hasError: boolean, hintId?: string) {
  const ids = [hasError ? `${id}-error` : '', hintId ?? ''].filter(Boolean).join(' ');
  return {
    'aria-invalid': hasError || undefined,
    'aria-describedby': ids || undefined,
  } as const;
}

// focus:border-primary — color change for all input methods
// focus-visible:ring-1 — visible ring for keyboard navigation (does not fire on mouse click)
const inputClass =
  'w-full bg-transparent border-b border-border text-foreground text-sm py-2.5 placeholder:text-muted-foreground/40 focus:border-primary focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary/30 focus-visible:ring-offset-0 transition-colors duration-200';

const TURNSTILE_SITE_KEY = import.meta.env.VITE_TURNSTILE_SITE_KEY as string | undefined;

// ── Page ──────────────────────────────────────────────────────────────────────
const ContactPage = () => {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [serverError, setServerError] = useState('');
  const [sentTo, setSentTo] = useState('');
  const [intent, setIntent] = useState<IntentId | ''>('');
  const [cfToken, setCfToken] = useState('');
  const honeypotRef = useRef<HTMLInputElement>(null);
  const turnstileRef = useRef<TurnstileInstance>(null);
  const successHeadingRef = useRef<HTMLHeadingElement>(null);

  const { register, handleSubmit, reset, control, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });
  const messageLength = (useWatch({ control, name: 'message' }) ?? '').length;

  // Move focus to the confirmation so keyboard and screen-reader users know
  // the message went through (the form they were in has just disappeared).
  useEffect(() => {
    if (status === 'success') successHeadingRef.current?.focus();
  }, [status]);

  const onSubmit = async (data: FormValues) => {
    setServerError('');
    // Submit stays enabled while the bot check runs, so say why instead of
    // silently ignoring the click.
    if (TURNSTILE_SITE_KEY && !cfToken) {
      setServerError('The spam check is still running. Wait a moment for it to finish, then send again.');
      setStatus('error');
      return;
    }
    setStatus('loading');
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 20_000); // 20 s hard cap
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          subject: buildSubject(intent, data.subject),
          message: data.message,
          _hp: honeypotRef.current?.value ?? '',
          cfToken,
        }),
        signal: controller.signal,
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        // Our own wording per status; the fallback sentence ("Try again, or
        // email us at …") is added where the error is shown.
        throw new Error(
          res.status === 400 && json.error
            ? json.error
            : res.status === 429
              ? "You've sent several messages in the last hour, so the form is paused for now."
              : "We couldn't send your message right now.",
        );
      }
      setSentTo(data.email);
      setStatus('success');
      reset();
      setIntent('');
      setCfToken('');
      turnstileRef.current?.reset();
    } catch (err: unknown) {
      const msg = err instanceof Error
        ? (err.name === 'AbortError' ? 'The request timed out.' : err.message)
        : "We couldn't send your message right now.";
      setServerError(msg);
      setStatus('error');
      turnstileRef.current?.reset();
    } finally {
      clearTimeout(timer);
    }
  };

  return (
    <PageLayout intensity="low">

      {/* ── Header ── */}
      <section className="relative z-10 min-h-[40vh] flex flex-col justify-end py-16 border-b border-border">
        <div className="container mx-auto px-6">
          <ScrollReveal>
            <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground mb-4">
              Contact
            </p>
            <h1
              className="font-heading font-extrabold leading-[0.88] tracking-tight text-foreground mb-6"
              style={{ fontSize: 'clamp(2.5rem, 6vw, 4.5rem)' }}
            >
              We'd love to<br />
              hear from <span style={{ color: 'var(--primary)' }}>you.</span>
            </h1>
            <p className="text-muted-foreground text-base leading-relaxed max-w-[50ch]">
              Questions about membership, events, partnerships, or anything else?
              Send us a message and an officer will reply within 24 hours.
            </p>
          </ScrollReveal>
        </div>
      </section>

      {/* ── Body ── */}
      <section className="relative z-10 py-16">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-8 lg:gap-24 items-start">

            {/* ── Left: channels ── */}
            <ScrollReveal>
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground mb-6">
                  Other ways to reach us
                </p>
                <div className="flex flex-col gap-5">
                  {channels.map((ch) => (
                    <a
                      key={ch.label}
                      href={ch.href}
                      target={ch.href.startsWith('mailto') ? undefined : '_blank'}
                      rel="noopener noreferrer"
                      className="flex items-start gap-3.5 group"
                    >
                      <div className="w-8 h-8 rounded-lg bg-muted/50 border border-border flex items-center justify-center shrink-0 group-hover:border-primary/40 group-hover:bg-primary/5 transition-colors duration-150">
                        <ch.icon className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary transition-colors duration-150" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-0.5">{ch.label}</p>
                        <p className="text-sm text-foreground font-medium leading-snug group-hover:text-primary transition-colors duration-150">
                          {ch.value}
                        </p>
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            </ScrollReveal>

            {/* ── Right: form ── */}
            <ScrollReveal delay={80}>

              {/* Success state */}
              {status === 'success' ? (
                <div className="flex flex-col items-start gap-5 py-6">
                  <div className="w-10 h-10 rounded-full bg-[var(--success)]/10 border border-[var(--success)]/30 flex items-center justify-center">
                    <CheckCircle2 className="w-5 h-5" style={{ color: 'var(--success)' }} aria-hidden="true" />
                  </div>
                  <div>
                    <h2
                      ref={successHeadingRef}
                      tabIndex={-1}
                      className="font-heading font-semibold text-foreground text-lg mb-1 focus:outline-none"
                    >
                      Message sent
                    </h2>
                    <p className="text-sm text-muted-foreground max-w-[45ch]">
                      Thanks for reaching out. An officer will reply to{' '}
                      <span className="text-foreground">{sentTo}</span> within 24 hours.
                    </p>
                    <p className="text-sm text-muted-foreground max-w-[45ch] mt-2">
                      No reply after a day? Check your spam folder, or email{' '}
                      <a href={`mailto:${EXTERNAL_LINKS.emailContact}`} className="text-primary underline underline-offset-2">
                        {EXTERNAL_LINKS.emailContact}
                      </a>.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setStatus('idle')}
                    className="inline-flex items-center gap-1.5 text-sm text-primary py-2 hover:gap-2.5 transition-all duration-150"
                  >
                    Send another message
                    <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-8" aria-labelledby="contact-form-heading">
                  <h2 id="contact-form-heading" className="sr-only">Send us a message</h2>

                  {/* Honeypot — hidden from real users, bots fill it in */}
                  <div aria-hidden="true" style={{ display: 'none' }}>
                    <input
                      ref={honeypotRef}
                      type="text"
                      name="website"
                      tabIndex={-1}
                      autoComplete="off"
                    />
                  </div>

                  {/* Why are you writing? (optional) */}
                  <fieldset>
                    <legend className="text-xs uppercase tracking-[0.12em] text-muted-foreground font-medium mb-3">
                      What brings you here? <span className="normal-case tracking-normal">(optional)</span>
                    </legend>
                    <div className="flex flex-wrap gap-2">
                      {INTENTS.map((option) => (
                        <label
                          key={option.id}
                          className={`inline-flex items-center gap-2 px-3 py-2.5 rounded border text-sm cursor-pointer transition-colors duration-150 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring ${
                            intent === option.id
                              ? 'border-primary bg-primary/10 text-foreground'
                              : 'border-border text-muted-foreground hover:border-primary/50'
                          }`}
                        >
                          <input
                            type="radio"
                            name="intent"
                            value={option.id}
                            checked={intent === option.id}
                            onChange={() => setIntent(option.id)}
                            className="sr-only"
                          />
                          {option.label}
                        </label>
                      ))}
                    </div>
                    {intent === 'joining' && (
                      <p className="text-sm text-muted-foreground mt-3 max-w-[55ch]">
                        Quickest way in: join the group on{' '}
                        <a href={EXTERNAL_LINKS.meetup} target="_blank" rel="noopener noreferrer" className="text-primary underline underline-offset-2">
                          Meetup<span className="sr-only"> (opens in a new tab)</span>
                        </a>{' '}
                        and fill out the{' '}
                        <a href={EXTERNAL_LINKS.memberInterestForm} target="_blank" rel="noopener noreferrer" className="text-primary underline underline-offset-2">
                          member interest form<span className="sr-only"> (opens in a new tab)</span>
                        </a>
                        . See every option on the{' '}
                        <Link to="/community" className="text-primary underline underline-offset-2">Community page</Link>.
                        You can still send a message below.
                      </p>
                    )}
                  </fieldset>

                  {/* Row: name + email */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                    <Field id="contact-name" label="Name" required error={errors.name?.message}>
                      <input
                        {...register('name')}
                        id="contact-name"
                        placeholder="Your name"
                        className={inputClass}
                        autoComplete="name"
                        aria-required="true"
                        maxLength={LIMITS.name}
                        {...describe('contact-name', !!errors.name)}
                      />
                    </Field>
                    <Field id="contact-email" label="Email" required error={errors.email?.message}>
                      <input
                        {...register('email')}
                        id="contact-email"
                        type="email"
                        inputMode="email"
                        placeholder="you@example.com"
                        className={inputClass}
                        autoComplete="email"
                        aria-required="true"
                        maxLength={LIMITS.email}
                        {...describe('contact-email', !!errors.email)}
                      />
                    </Field>
                  </div>

                  {/* Subject */}
                  <Field id="contact-subject" label="Subject (optional)" error={errors.subject?.message}>
                    <input
                      {...register('subject')}
                      id="contact-subject"
                      placeholder="What's this about?"
                      className={inputClass}
                      maxLength={LIMITS.subject}
                      {...describe('contact-subject', !!errors.subject)}
                    />
                  </Field>

                  {/* Message */}
                  <Field id="contact-message" label="Message" required error={errors.message?.message}>
                    <textarea
                      {...register('message')}
                      id="contact-message"
                      rows={5}
                      placeholder="Your message…"
                      className={`${inputClass} resize-y`}
                      aria-required="true"
                      maxLength={LIMITS.message}
                      {...describe('contact-message', !!errors.message, 'contact-message-hint')}
                    />
                    <p id="contact-message-hint" className="text-xs text-muted-foreground tabular-nums">
                      {messageLength.toLocaleString('en-US')} / {LIMITS.message.toLocaleString('en-US')} characters
                    </p>
                  </Field>

                  {/* Cloudflare Turnstile — only rendered when site key is configured */}
                  {TURNSTILE_SITE_KEY && (
                    <div>
                      <Turnstile
                        ref={turnstileRef}
                        siteKey={TURNSTILE_SITE_KEY}
                        onSuccess={setCfToken}
                        onExpire={() => setCfToken('')}
                        onError={() => setCfToken('')}
                        options={{ theme: 'dark' }}
                      />
                      <p className="text-xs text-muted-foreground mt-2">A quick automatic check that keeps spam out.</p>
                    </div>
                  )}

                  {/* Server error: announced, with a way to reach us anyway */}
                  {status === 'error' && serverError && (
                    <div role="alert" className="text-sm text-destructive flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" aria-hidden="true" />
                      <p>
                        {serverError} Try again, or email us at{' '}
                        <a href={`mailto:${EXTERNAL_LINKS.emailContact}`} className="underline underline-offset-2">
                          {EXTERNAL_LINKS.emailContact}
                        </a>.
                      </p>
                    </div>
                  )}

                  {/* Submit */}
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4 pt-2">
                    <button
                      type="submit"
                      disabled={status === 'loading'}
                      aria-busy={status === 'loading' || undefined}
                      className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded bg-primary text-primary-foreground font-semibold text-sm transition-all duration-150 hover:opacity-90 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed self-start"
                    >
                      {status === 'loading' ? (
                        <>
                          <span className="w-4 h-4 rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground animate-spin" aria-hidden="true" />
                          Sending…
                        </>
                      ) : (
                        <>
                          Send message
                          <MessageSquare className="w-4 h-4" aria-hidden="true" />
                        </>
                      )}
                    </button>
                    <p className="text-xs text-muted-foreground">
                      An officer replies within 24 hours. We only use your email to reply to you.
                    </p>
                  </div>

                </form>
              )}
            </ScrollReveal>

          </div>
        </div>
      </section>

    </PageLayout>
  );
};

export default ContactPage;
