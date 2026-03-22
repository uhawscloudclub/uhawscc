import PageLayout from '@/components/PageLayout';
import ScrollReveal from '@/components/ScrollReveal';
import { ArrowRight, CheckCircle2 } from 'lucide-react';

const team = [
  { name: 'Perry Takyi', role: 'Captain & Founding Member' },
  { name: 'Hiab Negash', role: 'Director of Marketing & Outreach' },
  { name: 'Quincy Britton', role: 'Director of Events' },
  { name: 'Ananya Shekhawat', role: 'Director of Operations' },
  { name: 'Charles Ezeribe', role: 'Director of Technical Education' },
  { name: 'Abdul Ayinde Alao', role: 'Director of Content & Media' },
];

const steps = [
  'Fill out our membership interest form',
  'RSVP to an upcoming event on Meetup',
  'Show up and start building',
];

const TeamPage = () => (
  <PageLayout>
    {/* Join section */}
    <section className="py-24">
      <div className="container mx-auto px-6">
        <ScrollReveal>
          <h1 className="font-heading font-bold text-4xl md:text-5xl text-center mb-4">
            Become a <span className="text-gradient">Member</span>
          </h1>
        </ScrollReveal>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto mt-12">
          <ScrollReveal delay={100}>
            <div className="flex flex-col justify-center">
              <p className="text-muted-foreground leading-relaxed text-lg">
                Membership is open to all University of Houston students.
                No experience required — just curiosity about the cloud.
              </p>
              <p className="text-muted-foreground leading-relaxed mt-4">
                Whether you're a computer science major or studying business, our workshops are designed to
                be accessible and hands-on. Come build with us.
              </p>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={200}>
            <div className="glass-card p-8 rounded-xl">
              <h3 className="font-heading font-semibold text-foreground mb-6">How to Join</h3>
              <div className="space-y-4">
                {steps.map((step, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-secondary mt-0.5 shrink-0" />
                    <p className="text-sm text-muted-foreground">
                      <span className="text-foreground font-medium">Step {i + 1}:</span> {step}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </ScrollReveal>
        </div>

        <ScrollReveal delay={300}>
          <div className="text-center mt-12">
            <a
              href="https://www.meetup.com/aws-cloud-club-at-univ-of-houston/?eventOrigin=your_groups"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-primary text-primary-foreground font-semibold transition-all duration-200 hover:opacity-90 active:scale-95 glow-purple text-base"
            >
              Apply to Join <ArrowRight className="w-5 h-5" />
            </a>
          </div>
        </ScrollReveal>
      </div>
    </section>

    {/* Leadership */}
    <section className="py-24 border-t border-border/20">
      <div className="container mx-auto px-6">
        <ScrollReveal>
          <h2 className="font-heading font-bold text-3xl md:text-4xl text-center mb-16">
            <span className="text-gradient">Leadership</span>
          </h2>
        </ScrollReveal>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {team.map((member, i) => (
            <ScrollReveal key={member.name} delay={i * 60}>
              <div className="glass-card p-6 rounded-xl text-center transition-all duration-300">
                {/* Avatar placeholder */}
                <div className="w-16 h-16 rounded-full bg-muted mx-auto mb-4 flex items-center justify-center text-lg font-heading font-bold text-primary">
                  {member.name.split(' ').map(n => n[0]).join('')}
                </div>
                <h3 className="font-heading font-semibold text-foreground text-sm">{member.name}</h3>
                <p className="text-xs text-muted-foreground mt-1">{member.role}</p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  </PageLayout>
);

export default TeamPage;
