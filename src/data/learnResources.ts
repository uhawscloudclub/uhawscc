import { EXTERNAL_LINKS } from '@/config/externalLinks';

/**
 * Free resources listed on /learn, below the Cloud Practitioner path.
 * Carried over from the old /resources page (minus the LinkTree, which the
 * "Ways to join" list on /community now covers), plus AWS's own student page.
 */
export interface LearnResource {
  title: string;
  /** Who it's for / what it costs, in a few words. */
  tag: string;
  desc: string;
  /** Visible link text; starts with a verb. */
  cta: string;
  href: string;
}

export const FREE_RESOURCES: readonly LearnResource[] = [
  {
    title: 'Create Your First AWS Account',
    tag: 'Start here',
    desc: 'Get started with AWS by creating a free account and accessing the AWS Free Tier. Takes about 10 minutes.',
    cta: 'Create AWS Account',
    href: 'https://aws.amazon.com/resources/create-account/',
  },
  {
    title: 'AWS Skill Builder',
    tag: 'Free training',
    desc: 'Free cloud training courses on AWS Skill Builder, including foundational, associate, and specialty paths.',
    cta: 'Explore Skill Builder',
    href: EXTERNAL_LINKS.skillBuilderHome,
  },
  {
    title: 'AWS Builder Center for students',
    tag: 'Free · From AWS',
    desc: "AWS's own student hub: self-paced courses, hands-on workshops, and student verification for a year of full Skill Builder access.",
    cta: 'Open the student hub',
    href: EXTERNAL_LINKS.builderCenterStudents,
  },
  {
    title: 'AWS Free Tier',
    tag: 'Hands-on practice',
    desc: 'Practice building on real AWS infrastructure with the AWS Free Tier at no cost for eligible services within limits.',
    cta: 'Get started free',
    href: EXTERNAL_LINKS.awsFreeTier,
  },
  {
    title: 'Free Exam Vouchers via AWS Academy',
    tag: 'UH students only',
    desc: "UH students can receive up to 4 fully discounted certification exam vouchers and a free 1-year Skill Builder subscription through AWS Academy. Fill out the form and we'll get you access via the CIS department.",
    cta: 'Request Access',
    href: EXTERNAL_LINKS.awsAcademySignupForm,
  },
  {
    title: 'Skill Builder Setup Guide',
    tag: 'AWS Academy holders',
    desc: 'Already have AWS Academy access? Step-by-step guide to activate your free Skill Builder subscription through Canvas and claim certification vouchers via Pearson Vue.',
    cta: 'View Guide',
    href: EXTERNAL_LINKS.skillBuilderSetupGuide,
  },
];
