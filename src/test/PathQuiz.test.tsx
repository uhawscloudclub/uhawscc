import { fireEvent, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import PathQuiz from "@/components/PathQuiz";
import { QUIZ, RESULTS, scoreQuiz } from "@/data/pathQuiz";
import { renderWithRouter } from "./test-utils";

describe("scoreQuiz", () => {
    it("suggests Cloud Practitioner to a newcomer who is exploring", () => {
        expect(scoreQuiz({ experience: "none", interest: "security", hours: "low", major: "business", goal: "explore" })).toBe("ccp");
    });

    it("suggests AI Practitioner for a data/AI interest", () => {
        expect(scoreQuiz({ experience: "some", interest: "ai", hours: "mid", major: "data", goal: "cert" })).toBe("aip");
    });

    it("suggests Solutions Architect to an experienced builder", () => {
        expect(scoreQuiz({ experience: "built", interest: "infra", hours: "high", major: "cs", goal: "internship" })).toBe("saa");
    });

    it("never suggests Solutions Architect to someone who has not used AWS", () => {
        expect(scoreQuiz({ experience: "none", interest: "infra", hours: "high", major: "cs", goal: "internship" })).not.toBe("saa");
    });

    it("breaks ties toward Cloud Practitioner and handles no answers", () => {
        expect(scoreQuiz({})).toBe("ccp");
    });

    it("can reach every result from some combination of answers", () => {
        const seen = new Set<string>();
        const walk = (i: number, answers: Record<string, string>) => {
            if (i === QUIZ.length) { seen.add(scoreQuiz(answers)); return; }
            for (const o of QUIZ[i].options) walk(i + 1, { ...answers, [QUIZ[i].id]: o.id });
        };
        walk(0, {});
        expect([...seen].sort()).toEqual(["aip", "ccp", "saa"]);
    });
});

describe("PathQuiz", () => {
    it("walks through five questions to a result, with back and retake", () => {
        renderWithRouter(<PathQuiz />);
        expect(screen.getByText("Question 1 of 5")).toBeInTheDocument();
        fireEvent.click(screen.getByRole("button", { name: "Never" }));
        expect(screen.getByText("Question 2 of 5")).toBeInTheDocument();

        fireEvent.click(screen.getByRole("button", { name: "Back" }));
        expect(screen.getByRole("button", { name: "Never" })).toHaveAttribute("aria-pressed", "true");
        fireEvent.click(screen.getByRole("button", { name: "Never" }));

        for (const label of ["Security", "Under 3", "Business", "Just exploring"]) {
            fireEvent.click(screen.getByRole("button", { name: label }));
        }
        const result = screen.getByTestId("quiz-result");
        expect(result).toHaveTextContent(RESULTS.ccp.name);
        expect(screen.getByRole("link", { name: /Request a free exam voucher/ })).toHaveAttribute("target", "_blank");

        fireEvent.click(screen.getByRole("button", { name: "Retake the quiz" }));
        expect(screen.getByText("Question 1 of 5")).toBeInTheDocument();
    });
});
