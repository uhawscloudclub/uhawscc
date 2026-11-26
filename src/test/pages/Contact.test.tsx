import { fireEvent, screen, waitFor, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import ContactPage from "@/pages/Contact";
import { EXTERNAL_LINKS } from "@/config/externalLinks";
import { LIMITS, buildSubject } from "@/lib/contactForm";
import { renderWithRouter } from "../test-utils";

function fill(label: RegExp, value: string) {
    fireEvent.input(screen.getByLabelText(label), { target: { value } });
}

function fillValid() {
    fill(/^Name/, "Ada Lovelace");
    fill(/^Email/, "ada@cougarnet.uh.edu");
    fill(/^Message/, "How do I join the next study cohort?");
}

function mockContact(response: { ok: boolean; status: number; body: unknown }) {
    const fetchMock = vi.fn().mockResolvedValue({ ok: response.ok, status: response.status, json: async () => response.body });
    vi.stubGlobal("fetch", fetchMock);
    return fetchMock;
}

afterEach(() => {
    vi.unstubAllGlobals();
});

describe("buildSubject", () => {
    it("prefixes the chosen reason, or uses either part alone", () => {
        expect(buildSubject("joining", "Cohort question")).toBe("Joining the club: Cohort question");
        expect(buildSubject("partner", "")).toBe("Speaking, sponsoring, or partnering");
        expect(buildSubject("", "  Just a subject  ")).toBe("Just a subject");
        expect(buildSubject("", "")).toBe("");
    });

    it("never exceeds the server's 200-character subject cap", () => {
        expect(buildSubject("partner", "x".repeat(LIMITS.subject)).length).toBeLessThanOrEqual(200);
    });
});

describe("Contact page", () => {
    it("uses the club's org email for the direct-email option", () => {
        renderWithRouter(<ContactPage />);
        expect(screen.getByRole("link", { name: /Email us directly/ })).toHaveAttribute("href", "mailto:sbguh@cougarnet.uh.edu");
        expect(EXTERNAL_LINKS.emailContact).toBe("sbguh@cougarnet.uh.edu");
    });

    it("links each error to its field and focuses the first invalid one", async () => {
        renderWithRouter(<ContactPage />);
        fireEvent.click(screen.getByRole("button", { name: /Send message/ }));

        const name = screen.getByLabelText(/^Name/);
        await waitFor(() => expect(name).toHaveAttribute("aria-invalid", "true"));
        expect(name).toHaveAccessibleDescription(/Enter your name/);
        expect(name).toHaveFocus();
        expect(screen.getByLabelText(/^Email/)).toHaveAccessibleDescription(/valid|like name@/i);
        expect(screen.getByLabelText(/^Message/)).toHaveAccessibleDescription(/at least 10 characters/);
        expect(screen.getByLabelText(/^Subject/)).not.toHaveAttribute("aria-invalid");
    });

    it("matches the server's length limits and shows a live character count", async () => {
        renderWithRouter(<ContactPage />);
        const message = screen.getByLabelText(/^Message/);
        expect(message).toHaveAttribute("maxLength", String(LIMITS.message));
        expect(screen.getByLabelText(/^Name/)).toHaveAttribute("maxLength", "100");

        fill(/^Message/, "Hello there");
        expect(message).toHaveAccessibleDescription("11 / 5,000 characters");

        fill(/^Name/, "Ada");
        fill(/^Email/, "ada@cougarnet.uh.edu");
        fill(/^Message/, "x".repeat(LIMITS.message + 1)); // bypasses maxLength, e.g. a paste via script
        fireEvent.click(screen.getByRole("button", { name: /Send message/ }));
        expect(await screen.findByText(/5,000 characters or fewer/)).toBeInTheDocument();
    });

    it("sends the chosen reason in the subject, then confirms with focus and next steps", async () => {
        const fetchMock = mockContact({ ok: true, status: 200, body: { ok: true } });
        renderWithRouter(<ContactPage />);

        fireEvent.click(screen.getByRole("radio", { name: "Joining the club" }));
        fillValid();
        fill(/^Subject/, "Cohort");
        fireEvent.click(screen.getByRole("button", { name: /Send message/ }));

        const heading = await screen.findByRole("heading", { name: "Message sent" });
        await waitFor(() => expect(heading).toHaveFocus());
        expect(screen.getByText(/An officer will reply to/)).toHaveTextContent("An officer will reply to ada@cougarnet.uh.edu within 24 hours.");

        const body = JSON.parse(fetchMock.mock.calls[0][1].body);
        expect(body).toEqual({
            name: "Ada Lovelace",
            email: "ada@cougarnet.uh.edu",
            subject: "Joining the club: Cohort",
            message: "How do I join the next study cohort?",
            _hp: "",
            cfToken: "",
        });
    });

    it("announces a server error with a way to email the club instead", async () => {
        mockContact({ ok: false, status: 503, body: { error: "Contact form is temporarily unavailable. Please email us directly." } });
        renderWithRouter(<ContactPage />);
        fillValid();
        fireEvent.click(screen.getByRole("button", { name: /Send message/ }));

        const alert = await screen.findByRole("alert");
        expect(alert).toHaveTextContent("We couldn't send your message right now. Try again, or email us at sbguh@cougarnet.uh.edu.");
        expect(within(alert).getByRole("link", { name: "sbguh@cougarnet.uh.edu" })).toHaveAttribute("href", "mailto:sbguh@cougarnet.uh.edu");
        // The form and what the student typed are still there.
        expect(screen.getByLabelText(/^Name/)).toHaveValue("Ada Lovelace");
    });

    it("for 'Joining the club', points to the faster self-serve options first", () => {
        renderWithRouter(<ContactPage />);
        expect(screen.queryByRole("link", { name: /member interest form/ })).not.toBeInTheDocument();
        fireEvent.click(screen.getByRole("radio", { name: "Joining the club" }));
        expect(screen.getByRole("link", { name: /member interest form/ })).toHaveAttribute("href", EXTERNAL_LINKS.memberInterestForm);
        expect(screen.getByRole("link", { name: /^Meetup/ })).toHaveAttribute("href", EXTERNAL_LINKS.meetup);
    });

    it("states the reply time and privacy note before sending", () => {
        renderWithRouter(<ContactPage />);
        expect(screen.getByText(/An officer replies within 24 hours\. We only use your email to reply to you\./)).toBeInTheDocument();
    });

    it("explains a rate-limit (429) in plain words", async () => {
        mockContact({ ok: false, status: 429, body: { error: "Too many messages sent. Please wait an hour and try again." } });
        renderWithRouter(<ContactPage />);
        fillValid();
        fireEvent.click(screen.getByRole("button", { name: /Send message/ }));
        expect(await screen.findByRole("alert")).toHaveTextContent(/sent several messages in the last hour/);
    });
});
