import PageLayout from '@/components/PageLayout';
import ScrollReveal from '@/components/ScrollReveal';
import { GraduationCap, Award, Users } from 'lucide-react';

const AboutPage = () => (
  <PageLayout>
    <section className="py-24">
      <div className="container mx-auto px-6">
        <ScrollReveal>
          <h1 className="font-heading font-bold text-4xl md:text-5xl text-center mb-4">
            What We <span className="text-gradient">Do</span>
          </h1>
          <p className="text-center text-muted-foreground max-w-xl mx-auto mb-16">
            We bring cloud computing education, community, and career opportunities to University of Houston students.
          </p>
        </ScrollReveal>

        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              icon: <GraduationCap className="w-8 h-8 text-primary" />,
              title: 'Hands-On Learning',
              desc: 'Workshops, labs, and live cloud demos built around real AWS services. From EC2 to Lambda, we learn by building.',
            },
            {
              icon: <Award className="w-8 h-8 text-secondary" />,
              title: 'AWS Badge Progression',
              desc: 'Club events count toward official AWS Cloud Clubs recognition milestones. Track your progress and earn badges.',
            },
            {
              icon: <Users className="w-8 h-8 text-primary" />,
              title: 'Community & Careers',
              desc: 'Connect with peers, alumni, and Houston-area cloud professionals. Build your network while you build in the cloud.',
            },
          ].map((card, i) => (
            <ScrollReveal key={card.title} delay={i * 80}>
              <div className="glass-card p-8 rounded-xl h-full transition-all duration-300">
                <div className="mb-5">{card.icon}</div>
                <h3 className="font-heading font-semibold text-lg text-foreground mb-3">{card.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{card.desc}</p>
              </div>
            </ScrollReveal>
          ))}
        </div>

        <ScrollReveal delay={300}>
          <div className="mt-20 glass-card p-8 md:p-12 rounded-xl text-center">
            <p className="text-muted-foreground leading-relaxed max-w-2xl mx-auto">
              AWS Cloud Club at UH is part of the <strong className="text-foreground">AWS Cloud Clubs program</strong> — a global
              network of student communities supported by Amazon Web Services. We are not an official AWS or Amazon employee
              organization — we're students building for the cloud, together.
            </p>
          </div>
        </ScrollReveal>
      </div>
    </section>
  </PageLayout>
);

export default AboutPage;
