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
        defaultOptions: { queries: { retry: false } },
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
