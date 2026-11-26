import { screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import WaysToJoin from "@/components/WaysToJoin";
import { EXTERNAL_LINKS } from "@/config/externalLinks";
import { JOIN_CHANNELS } from "@/data/joinChannels";
import { renderWithRouter } from "./test-utils";

describe("WaysToJoin", () => {
    it("lists Meetup first, as the main way to join", () => {
        expect(JOIN_CHANNELS[0].href).toBe(EXTERNAL_LINKS.meetup);
    });

    it("explains what each channel is for and links to the right place", () => {
        renderWithRouter(<WaysToJoin />);
        const items = screen.getAllByRole("listitem");
        expect(items).toHaveLength(JOIN_CHANNELS.length);

        JOIN_CHANNELS.forEach((channel, i) => {
            const item = within(items[i]);
            expect(item.getByRole("heading", { name: channel.name })).toBeInTheDocument();
            expect(item.getByText(channel.purpose)).toBeInTheDocument();
            expect(item.getByRole("link", { name: new RegExp(channel.action) })).toHaveAttribute("href", channel.href);
        });
    });

    it("links the member interest form", () => {
        renderWithRouter(<WaysToJoin />);
        expect(screen.getByRole("link", { name: /Fill out the form/i })).toHaveAttribute(
            "href",
            "https://forms.cloud.microsoft/r/XiLmEDbKSw",
        );
    });

    it("opens external sites in a new tab safely and keeps Contact in-site", () => {
        renderWithRouter(<WaysToJoin />);
        for (const channel of JOIN_CHANNELS) {
            const link = screen.getByRole("link", { name: new RegExp(channel.action) });
            if (channel.internal) {
                expect(link).not.toHaveAttribute("target");
            } else {
                expect(link).toHaveAttribute("target", "_blank");
                expect(link).toHaveAttribute("rel", "noopener noreferrer");
                expect(link.getAttribute("href")).toMatch(/^https:\/\//);
            }
        }
    });
});
