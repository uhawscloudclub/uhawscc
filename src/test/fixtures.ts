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
    awsAccount: "https://aws.amazon.com/resources/create-account/",
    skillBuilder: "https://skillbuilder.aws",
    freeTier: "https://aws.amazon.com/free",
    linkTree: "https://linktr.ee/uhawscc",
} as const;
