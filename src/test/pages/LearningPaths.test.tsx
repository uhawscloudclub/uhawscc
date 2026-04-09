import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import LearningPathsPage from "@/pages/LearningPaths";
import { renderWithRouter } from "../test-utils";

describe("Learning Paths page", () => {
    it("renders the learning paths route content", () => {
        renderWithRouter(<LearningPathsPage />);
        expect(screen.getByRole("heading", { name: /Your Cloud Path/i })).toBeInTheDocument();
    });
});
