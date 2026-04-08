import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi, afterEach } from "vitest";
import ScrollReveal from "@/components/ScrollReveal";

describe("ScrollReveal", () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    it("renders its children", () => {
        render(<ScrollReveal>Hello World</ScrollReveal>);
        expect(screen.getByText("Hello World")).toBeInTheDocument();
    });

    it("wraps children in a div with the hidden initial CSS classes", () => {
        const { container } = render(<ScrollReveal>Content</ScrollReveal>);
        const wrapper = container.firstChild as HTMLElement;
        expect(wrapper.tagName).toBe("DIV");
        expect(wrapper).toHaveClass("opacity-0");
        expect(wrapper).toHaveClass("translate-y-5");
    });

    it("calls IntersectionObserver.observe on mount", () => {
        const observeSpy = vi.spyOn(
            window.IntersectionObserver.prototype,
            "observe",
        );
        render(<ScrollReveal>Content</ScrollReveal>);
        expect(observeSpy).toHaveBeenCalledTimes(1);
    });

    it("calls IntersectionObserver.disconnect on unmount", () => {
        const disconnectSpy = vi.spyOn(
            window.IntersectionObserver.prototype,
            "disconnect",
        );
        const { unmount } = render(<ScrollReveal>Content</ScrollReveal>);
        unmount();
        expect(disconnectSpy).toHaveBeenCalledTimes(1);
    });

    it("accepts and applies an optional className prop", () => {
        const { container } = render(
            <ScrollReveal className="my-class">Content</ScrollReveal>,
        );
        expect(container.firstChild).toHaveClass("my-class");
    });
});
