/**
 * Shared test fixtures for team and resource data.
 * Imported by both unit tests and E2E tests to keep a single source of truth.
 */

export const TEAM_MEMBERS = [
    {
        name: "Perry Takyi",
        linkedinUrl: "https://www.linkedin.com/in/perry-takyi/",
    },
    {
        name: "Hiab Negash",
        linkedinUrl: "https://www.linkedin.com/in/hiab-negash/",
    },
    {
        name: "Quincy Britton",
        linkedinUrl: "https://www.linkedin.com/in/quincy-britton-a35508317/",
    },
    {
        name: "Ananya Shekhawat",
        linkedinUrl: "https://www.linkedin.com/in/-ananya-shekhawat/",
    },
    {
        name: "Charles Ezeribe",
        linkedinUrl: "https://www.linkedin.com/in/charles-ezeribe/",
    },
    {
        name: "Abdul Ayinde Alao",
        linkedinUrl: "https://www.linkedin.com/in/abdul-azeez-ayinde/",
    },
] as const;

export const RESOURCE_LINKS = {
    skillBuilderHome: "https://skillbuilder.aws/",
    "AWS CCP Certification Page": "https://aws.amazon.com/certification/certified-cloud-practitioner/",
    "Official Exam Guide PDF (CLF-C02)": "https://d1.awsstatic.com/training-and-certification/docs-cloud-practitioner/AWS-Certified-Cloud-Practitioner_Exam-Guide.pdf",
    "AWS Cloud Practitioner Essentials": "https://skillbuilder.aws/learn/94T2BEN85A/aws-cloud-practitioner-essentials/8D79F3AVR7",
    "AWS Cloud Quest: Cloud Practitioner": "https://explore.skillbuilder.aws/learn/course/external/view/elearning/11458/aws-cloud-quest-cloud-practitioner",
    "AWS Free Tier — Create Your Account": "https://aws.amazon.com/free",
    "Exam Prep Plan: CLF-C02": "https://skillbuilder.aws/learning-plan/8UUCEZGNX4/exam-prep-plan-aws-certified-cloud-practitioner-clfc02--english/1J2VTQSGU2",
    "Official Practice Exam (CLF-C02)": "https://skillbuilder.aws/learn/JSJ5VBDBRG/official-practice-exam-aws-certified-cloud-practitioner-clfc02--english/FHCY1FNYXJ",
    "Cloud Practitioner Training Hub": "https://aws.amazon.com/training/learn-about/cloud-practitioner/",
} as const;
