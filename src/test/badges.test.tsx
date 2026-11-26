import { act, fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { MemoryRouter } from "react-router-dom";
import PixelToaster from "@/components/PixelToaster";
import LearnRewards from "@/components/LearnRewards";
import MascotBuddy, { MASCOT_TIPS } from "@/components/MascotBuddy";
import NotFound from "@/pages/NotFound";
import { BADGES, EXPLORER_PAGES, recordPageVisit, unlockBadge } from "@/lib/badges";
import { showPixelToast } from "@/lib/pixelToast";

const card = { levelLabel: "Level 2 of 5", levelTitle: "Get Oriented", done: 2, total: 10 };

describe("badges", () => {
    it("starts with every badge locked and shows hints, not names", () => {
        render(<LearnRewards card={card} />);
        expect(screen.getByRole("heading", { name: `Badges 0/${BADGES.length}` })).toBeInTheDocument();
        expect(screen.getAllByText("Locked badge")).toHaveLength(BADGES.length);
        expect(screen.queryByText("Pathfinder")).not.toBeInTheDocument();
    });

    it("unlocks once, persists, and toasts", () => {
        render(<><PixelToaster /><LearnRewards card={card} /></>);
        act(() => unlockBadge("pathfinder"));
        act(() => unlockBadge("pathfinder"));
        expect(screen.getByTestId("pixel-toast")).toHaveTextContent("Badge unlocked");
        expect(screen.getAllByText("Pathfinder")).toHaveLength(2); // toast + tile
        expect(screen.getByRole("heading", { name: `Badges 1/${BADGES.length}` })).toBeInTheDocument();
        expect(JSON.parse(localStorage.getItem("uh_aws_sbg_badges_v1") ?? "[]")).toEqual(["pathfinder"]);
    });

    it("unlocks Explorer only after every main page is visited", () => {
        render(<LearnRewards card={card} />);
        act(() => EXPLORER_PAGES.slice(0, -1).forEach(recordPageVisit));
        act(() => recordPageVisit("/not-a-page"));
        expect(screen.queryByText("Explorer")).not.toBeInTheDocument();
        act(() => recordPageVisit(EXPLORER_PAGES[EXPLORER_PAGES.length - 1]));
        expect(screen.getByText("Explorer")).toBeInTheDocument();
    });

    it("unlocks Space Buddy after hearing every mascot tip", () => {
        render(<><MascotBuddy /><LearnRewards card={card} /></>);
        for (let i = 0; i < MASCOT_TIPS.length; i++) fireEvent.click(screen.getAllByRole("button", { name: /astronaut/ })[0]);
        expect(screen.getByText("Space Buddy")).toBeInTheDocument();
    });

    it("unlocks Lost in Space on the 404 page", () => {
        render(<MemoryRouter initialEntries={["/nope"]}><NotFound /></MemoryRouter>);
        expect(screen.getByTestId("pixel-toast")).toHaveTextContent("Lost in Space");
    });
});

describe("PixelToaster", () => {
    it("queues toasts and can be dismissed", () => {
        render(<PixelToaster />);
        act(() => {
            showPixelToast({ kicker: "Level up!", title: "1 of 5 levels cleared", icon: "star" });
            showPixelToast({ kicker: "Badge unlocked", title: "First Step", icon: "check" });
        });
        expect(screen.getByTestId("pixel-toast")).toHaveTextContent("1 of 5 levels cleared");
        fireEvent.click(screen.getByRole("button", { name: "Dismiss" }));
        expect(screen.getByTestId("pixel-toast")).toHaveTextContent("First Step");
    });
});
