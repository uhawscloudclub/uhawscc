## ADDED Requirements

### Requirement: Lazy route chunk load failures trigger a single automatic reload
When a code-split route's dynamic `import()` fails because its chunk is no longer served
(stale deploy), the system SHALL automatically reload the page once, so the user reaches
the requested route on the current deployed build without seeing an error screen.

#### Scenario: Navigating to a lazy route after a new deploy
- **WHEN** a user clicks a `Link`/`NavLink` to a lazy-loaded route and the browser's
  dynamic `import()` for that route's chunk fails to load (e.g. 404 because a newer
  deploy replaced `dist/`)
- **THEN** the app detects this as a chunk-load failure and calls
  `window.location.reload()` exactly once, without ever rendering the generic
  "Something went wrong" fallback for this first failure

#### Scenario: Reload succeeds
- **WHEN** the automatic reload from the previous scenario completes
- **THEN** the freshly loaded `index.html` references the current build's chunk hashes and
  the requested route renders normally

### Requirement: Repeated chunk load failures still surface the fallback UI
The system SHALL NOT reload indefinitely. If a chunk-load failure recurs after the
one-time automatic reload (within the same browser session), the system SHALL render the
existing `ErrorBoundary` fallback UI instead of reloading again.

#### Scenario: Chunk load fails again after the automatic reload
- **WHEN** a chunk-load failure is detected and the session-scoped "already retried" marker
  shows a reload already happened for this session
- **THEN** the app renders the `ErrorBoundary` fallback ("Something went wrong") with its
  manual Refresh button, and does not call `window.location.reload()` again automatically

### Requirement: Non-chunk render errors are unaffected
Errors thrown by application code that are not chunk-load failures (e.g. a genuine bug in
a component) SHALL continue to be caught and rendered by the existing `ErrorBoundary`
fallback UI, with no automatic reload attempted.

#### Scenario: A component throws a normal render error
- **WHEN** any component throws an error that does not match the chunk-load-failure
  signature produced by the lazy-loading helper
- **THEN** `ErrorBoundary` renders its fallback UI immediately, with no automatic reload
