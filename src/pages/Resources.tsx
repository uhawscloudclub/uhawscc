import PageLayout from '@/components/PageLayout';
import ScrollReveal from '@/components/ScrollReveal';
import { UserPlus, BookOpen, Server, TreePine, ArrowRight } from 'lucide-react';

const resources = [
    {
        icon: <UserPlus className="w-7 h-7 text-primary" />,
        title: 'Create Your First AWS Account',
        desc: 'Get started with AWS by creating a free account and accessing the AWS Free Tier.',
        cta: 'Create AWS Account',
        href: 'https://aws.amazon.com/resources/create-account/',
        external: true,
    },
    {
        icon: <BookOpen className="w-7 h-7 text-secondary" />,
        title: 'AWS Skill Builder',
        desc: 'Access free cloud training courses on AWS Skill Builder, including foundational, associate, and specialty paths.',
        cta: 'Explore AWS Skill Builder',
        href: 'https://skillbuilder.aws',
        external: true,
    },
    {
        icon: <Server className="w-7 h-7 text-primary" />,
        title: 'AWS Free Tier',
        desc: 'Practice building on real AWS infrastructure with the AWS Free Tier — no cost for eligible services.',
        cta: 'Get Started',
        href: 'https://aws.amazon.com/free',
        external: true,
    },
    {
        icon: <TreePine className="w-7 h-7 text-secondary" />,
        title: 'Check out our LinkTree',
        desc: 'Visit our LinkTree for a curated list of our social media, resources, and ways to get involved with the community.',
        cta: 'Visit LinkTree',
        href: 'https://linktr.ee/uhawscc',
        external: true,
    },
];

const ResourcesPage = () => (
    <PageLayout>
        <section className="py-24">
            <div className="container mx-auto px-6">
                <ScrollReveal>
                    <h1 className="font-heading font-bold text-4xl md:text-5xl text-center mb-4">
                        Member <span className="text-gradient">Resources</span>
                    </h1>
                    <p className="text-center text-muted-foreground max-w-xl mx-auto mb-16">
                        Tools, training, and community access to accelerate your cloud journey.
                    </p>
                </ScrollReveal>

                <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                    {resources.map((r, i) => (
                        <ScrollReveal key={r.title} delay={i * 80}>
                            <div className="glass-card p-8 rounded-xl h-full flex flex-col transition-all duration-300">
                                <div className="mb-4">{r.icon}</div>
                                <h3 className="font-heading font-semibold text-lg text-foreground mb-2">{r.title}</h3>
                                <p className="text-sm text-muted-foreground leading-relaxed mb-6 flex-1">{r.desc}</p>
                                <a
                                    href={r.href}
                                    target={r.external ? '_blank' : undefined}
                                    rel={r.external ? 'noopener noreferrer' : undefined}
                                    className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:text-secondary transition-colors active:scale-95"
                                >
                                    {r.cta} <ArrowRight className="w-4 h-4" />
                                </a>
                            </div>
                        </ScrollReveal>
                    ))}
                </div>
            </div>
        </section>
    </PageLayout>
);

export default ResourcesPage;
