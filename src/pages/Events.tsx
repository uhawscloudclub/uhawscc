import PageLayout from '@/components/PageLayout';
import ScrollReveal from '@/components/ScrollReveal';
import { Calendar, MapPin, ArrowRight } from 'lucide-react';
import { EXTERNAL_LINKS } from '@/config/externalLinks';

const events = [
  {
    title: 'Intro to AWS Cloud & Club Kickoff',
    date: 'TBD — Check Meetup',
    location: 'University of Houston, PGH Building',
    desc: 'Meet the team, learn about the AWS Cloud Clubs program, and get started with your first cloud project.',
  },
  {
    title: 'Hands-On: Deploy Your First App on AWS',
    date: 'TBD — Check Meetup',
    location: 'University of Houston',
    desc: 'A step-by-step workshop where you will deploy a web application using AWS Amplify and S3.',
  },
];

const EventsPage = () => (
  <PageLayout>
    <section className="py-24">
      <div className="container mx-auto px-6">
        <ScrollReveal>
          <h1 className="font-heading font-bold text-4xl md:text-5xl text-center mb-4">
            Upcoming <span className="text-gradient">Events</span>
          </h1>
          <p className="text-center text-muted-foreground max-w-xl mx-auto mb-16">
            All events are published on Meetup. RSVP to save your spot.
          </p>
        </ScrollReveal>

        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {events.map((ev, i) => (
            <ScrollReveal key={ev.title} delay={i * 100}>
              <div className="glass-card p-8 rounded-xl h-full flex flex-col transition-all duration-300">
                <h3 className="font-heading font-semibold text-lg text-foreground mb-4">{ev.title}</h3>
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                  <Calendar className="w-4 h-4 text-secondary" />
                  {ev.date}
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                  <MapPin className="w-4 h-4 text-primary" />
                  {ev.location}
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed mb-6 flex-1">{ev.desc}</p>
                <a
                  href={EXTERNAL_LINKS.meetup}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:text-secondary transition-colors active:scale-95"
                >
                  RSVP on Meetup <ArrowRight className="w-4 h-4" />
                </a>
              </div>
            </ScrollReveal>
          ))}
        </div>

        <ScrollReveal delay={250}>
          <div className="text-center mt-12">
            <a
              href={EXTERNAL_LINKS.meetup}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              See all events on Meetup <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </ScrollReveal>
      </div>
    </section>
  </PageLayout>
);

export default EventsPage;
