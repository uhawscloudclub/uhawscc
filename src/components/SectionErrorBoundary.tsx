import { Component, type ErrorInfo, type ReactNode } from "react";

interface Props {
  children: ReactNode;
  /** Rendered in place of the children on failure. Defaults to rendering nothing. */
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
}

/**
 * Scopes a failure to a single optional page section.
 *
 * Deliberately NOT the app-level ErrorBoundary. That one wraps every route and
 * recovers from a chunk failure by calling window.location.reload() — correct
 * for a route you cannot render without, but disproportionate for a decorative
 * section: a failed carousel chunk would reload the entire homepage, and a
 * second failure would replace it with the full-screen error panel.
 *
 * Here a failure simply drops the section. Navigation, hero, proof strip and
 * every other section stay on screen.
 */
class SectionErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    if (import.meta.env.DEV) {
      console.error("[SectionErrorBoundary]", error, info.componentStack);
    }
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback ?? null;
    }

    return this.props.children;
  }
}

export default SectionErrorBoundary;
