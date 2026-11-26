import { fireEvent, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import Navbar from "@/components/Navbar";
import { resetSoundForTests } from "@/lib/sound";
import { renderWithRouter } from "./test-utils";

afterEach(() => {
    localStorage.removeItem("uh_aws_sbg_sound_v1");
    resetSoundForTests();
});

describe("sound toggle", () => {
    it("is off by default and remembers when turned on", () => {
        renderWithRouter(<Navbar />);
        const [toggle] = screen.getAllByRole("button", { name: "Sound effects" });
        expect(toggle).toHaveAttribute("aria-pressed", "false");
        fireEvent.click(toggle);
        expect(screen.getAllByRole("button", { name: "Sound effects" })[0]).toHaveAttribute("aria-pressed", "true");
        expect(localStorage.getItem("uh_aws_sbg_sound_v1")).toBe("on");
    });
});
