import { type ReactNode } from "react";
import { render, type RenderOptions } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/components/ui/tooltip";

interface RenderWithRouterOptions extends Omit<RenderOptions, "wrapper"> {
    initialRoute?: string;
}

export function renderWithRouter(
    ui: ReactNode,
    { initialRoute = "/", ...renderOptions }: RenderWithRouterOptions = {},
) {
    const queryClient = new QueryClient({
        // retryDelay: 0 matters even though retry defaults to false here —
        // useEvents() sets its own `retry: 1` directly on the query, which
        // overrides this client's `retry` default. Without pinning the delay
        // too, that retry would wait through TanStack Query's real ~1s
        // exponential backoff in every test that exercises a failed fetch.
        defaultOptions: { queries: { retry: false, retryDelay: 0 } },
    });

    const Wrapper = ({ children }: { children: ReactNode }) => (
        <QueryClientProvider client={queryClient}>
            <TooltipProvider>
                <MemoryRouter initialEntries={[initialRoute]}>
                    {children}
                </MemoryRouter>
            </TooltipProvider>
        </QueryClientProvider>
    );

    return render(ui, { wrapper: Wrapper, ...renderOptions });
}
