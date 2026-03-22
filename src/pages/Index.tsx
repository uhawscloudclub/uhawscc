import PageLayout from '@/components/PageLayout';
import ScrollReveal from '@/components/ScrollReveal';
import { ArrowRight, Cloud } from 'lucide-react';

const HomePage = () => (
  <PageLayout>
    {/* Hero */}
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
      {/* Wireframe cloud bg */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div
          className="w-[500px] h-[500px] md:w-[700px] md:h-[700px] rounded-full border border-primary/10 opacity-20"
          style={{ animation: 'rotate-slow 60s linear infinite' }}
        >
          <div className="absolute inset-8 rounded-full border border-secondary/10" />
          <div className="absolute inset-16 rounded-full border border-primary/5" />
          <div className="absolute inset-24 rounded-full border border-secondary/5" />
        </div>
      </div>

      <div className="container mx-auto px-6 text-center relative z-10">
        <ScrollReveal>
          {/* Logo placeholder */}
          <div className="mx-auto mb-8 w-24 h-24 rounded-2xl glass-card flex items-center justify-center">
            <Cloud className="w-10 h-10 text-primary" />
          </div>
          <p className="text-xs text-muted-foreground tracking-widest uppercase mb-2">
            [AWS Cloud Club Logo — to be swapped in]
          </p>
        </ScrollReveal>

        <ScrollReveal delay={100}>
          <h1 className="font-heading font-bold text-4xl sm:text-5xl md:text-7xl leading-[0.95] tracking-tight mb-6 text-wrap-balance">
            Build in the <span className="text-gradient">Cloud</span>.
            <br />
            Learn Together.
          </h1>
        </ScrollReveal>

        <ScrollReveal delay={200}>
          <p className="max-w-2xl mx-auto text-muted-foreground text-base sm:text-lg leading-relaxed mb-10 text-wrap-pretty">
            The AWS Cloud Club at the University of Houston — where students gain real-world
            cloud skills, earn AWS certifications, and launch their careers.
          </p>
        </ScrollReveal>

        <ScrollReveal delay={300}>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="https://www.meetup.com/aws-cloud-club-at-univ-of-houston/?eventOrigin=your_groups"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full bg-primary text-primary-foreground font-semibold transition-all duration-200 hover:opacity-90 active:scale-95 glow-purple"
            >
              Join Our Community
              <ArrowRight className="w-4 h-4" />
            </a>
            <a
              href="/events"
              className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full border border-border text-foreground font-semibold transition-all duration-200 hover:border-primary/50 hover:text-primary active:scale-95"
            >
              View Upcoming Events
            </a>
          </div>
        </ScrollReveal>
      </div>
    </section>

    {/* About preview */}
    <section className="py-24 relative z-10">
      <div className="container mx-auto px-6">
        <ScrollReveal>
          <h2 className="font-heading font-bold text-3xl md:text-4xl text-center mb-4">
            What We <span className="text-gradient">Do</span>
          </h2>
        </ScrollReveal>

        <div className="grid md:grid-cols-3 gap-6 mt-12">
          {[
            {
              icon: '🎓',
              title: 'Hands-On Learning',
              desc: 'Workshops, labs, and live cloud demos built around real AWS services.',
            },
            {
              icon: '🏅',
              title: 'AWS Badge Progression',
              desc: 'Club events count toward official AWS Cloud Clubs recognition milestones.',
            },
            {
              icon: '🤝',
              title: 'Community & Careers',
              desc: 'Connect with peers, alumni, and Houston-area cloud professionals.',
            },
          ].map((card, i) => (
            <ScrollReveal key={card.title} delay={i * 80}>
              <div className="glass-card p-8 rounded-xl h-full transition-all duration-300">
                <div className="text-3xl mb-4">{card.icon}</div>
                <h3 className="font-heading font-semibold text-lg text-foreground mb-2">{card.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{card.desc}</p>
              </div>
            </ScrollReveal>
          ))}
        </div>

        <ScrollReveal delay={300}>
          <p className="text-center text-sm text-muted-foreground mt-12 max-w-2xl mx-auto leading-relaxed">
            AWS Cloud Club at UH is part of the AWS Cloud Clubs program — a global network of
            student communities supported by Amazon Web Services.
          </p>
        </ScrollReveal>
      </div>
    </section>
  </PageLayout>
);

export default HomePage;
