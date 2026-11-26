import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import MascotBuddy, { MASCOT_TIPS } from "@/components/MascotBuddy";

describe("MascotBuddy", () => {
    it("shows a tip on tap and cycles through them", () => {
        render(<MascotBuddy />);
        expect(screen.queryByTestId("mascot-tip")).not.toBeInTheDocument();

        fireEvent.click(screen.getByRole("button", { name: "Tap the astronaut for a tip" }));
        expect(screen.getByTestId("mascot-tip")).toHaveTextContent(MASCOT_TIPS[0]);

        fireEvent.click(screen.getByRole("button", { name: "Next tip from the astronaut" }));
        expect(screen.getByTestId("mascot-tip")).toHaveTextContent(MASCOT_TIPS[1]);
    });

    it("closes the bubble on Escape", () => {
        render(<MascotBuddy />);
        fireEvent.click(screen.getByRole("button"));
        fireEvent.keyDown(document, { key: "Escape" });
        expect(screen.queryByTestId("mascot-tip")).not.toBeInTheDocument();
    });
});
