import { lazy, type ComponentType } from "react";

// Browsers use different wording for a dynamic import() that 404s (e.g. because
// a newer deploy replaced dist/ and this hashed chunk no longer exists).
const CHUNK_LOAD_ERROR_PATTERNS = [
  /failed to fetch dynamically imported module/i,
  /error loading dynamically imported module/i,
  /importing a module script failed/i,
];

export class ChunkLoadError extends Error {
  constructor(cause: unknown) {
    super("Failed to load a page chunk — likely a stale build after a new deploy.");
    this.name = "ChunkLoadError";
    this.cause = cause;
  }
}

function isChunkLoadError(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error);
  return CHUNK_LOAD_ERROR_PATTERNS.some((pattern) => pattern.test(message));
}

/**
 * React.lazy() wrapper for route-level code splitting. Re-throws a stale-chunk
 * import() failure as a typed ChunkLoadError so ErrorBoundary can tell it apart
 * from a genuine render bug and recover with a reload instead of a dead end.
 */
export function lazyWithReload<T extends ComponentType<unknown>>(
  factory: () => Promise<{ default: T }>,
) {
  return lazy(() =>
    factory().catch((error: unknown) => {
      throw isChunkLoadError(error) ? new ChunkLoadError(error) : error;
    }),
  );
}
