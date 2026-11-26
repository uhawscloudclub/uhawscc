/**
 * External links configuration
 * Centralized management of external URLs for easy updates
 * without requiring code changes.
 */

export const EXTERNAL_LINKS = {
  meetup: 'https://www.meetup.com/aws-sbg-at-univ-of-houston/',
  discord: 'https://discord.gg/8eABTmM8mT',
  linkedin: 'https://www.linkedin.com/company/aws-student-builder-group-uh',
  instagram: 'https://www.instagram.com/awssbg_uh/',
  emailContact: 'sbguh@cougarnet.uh.edu',
  memberInterestForm: 'https://forms.cloud.microsoft/r/XiLmEDbKSw',
  ccpEssentials: 'https://skillbuilder.aws/learn/94T2BEN85A/aws-cloud-practitioner-essentials/8D79F3AVR7',
  ccpExamPrepPlan: 'https://skillbuilder.aws/learning-plan/8UUCEZGNX4/exam-prep-plan-aws-certified-cloud-practitioner-clfc02--english/1J2VTQSGU2',
  ccpCloudQuest: 'https://explore.skillbuilder.aws/learn/course/external/view/elearning/11458/aws-cloud-quest-cloud-practitioner',
  ccpOfficialPracticeExam: 'https://skillbuilder.aws/learn/JSJ5VBDBRG/official-practice-exam-aws-certified-cloud-practitioner-clfc02--english/FHCY1FNYXJ',
  ccpExamGuide: 'https://d1.awsstatic.com/training-and-certification/docs-cloud-practitioner/AWS-Certified-Cloud-Practitioner_Exam-Guide.pdf',
  awsFreeTier: 'https://aws.amazon.com/free',
  ccpCertPage: 'https://aws.amazon.com/certification/certified-cloud-practitioner/',
  ccpTrainingHub: 'https://aws.amazon.com/training/learn-about/cloud-practitioner/',
  skillBuilderHome: 'https://skillbuilder.aws/',
  builderCenterStudents: 'https://builder.aws.com/learn/students',
  // The club's own AWS Builder Center sign-up link (supplied by the officers;
  // a bit.ly short link, so it can be re-pointed without a code change).
  builderCenterSignup: 'https://bit.ly/4pN9Aqs',
  studentRewards: 'https://builder.aws.com/student-rewards',
  skillBuilderSetupGuide: '/docs/skill-builder-guide.pdf',
} as const;

export const LINKS = EXTERNAL_LINKS;
