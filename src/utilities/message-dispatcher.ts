export type OriginMatcher = (origin: string) => boolean;
export type TrustedMessageHandler = (event: MessageEvent) => void;

interface MessageRoute {
  matches: OriginMatcher;
  handle: TrustedMessageHandler;
}

// One window 'message' listener serves every integration. Routes self-filter
// by origin, so a handler can only ever see an event its matcher accepted —
// the origin gate is enforced here, structurally, rather than re-implemented
// per listener file.
const routes: MessageRoute[] = [];
let isListening = false;

function dispatch(event: MessageEvent): void {
  for (const route of routes) {
    if (route.matches(event.origin)) {
      route.handle(event);
    }
  }
}

/**
 * Register a postMessage handler behind an origin gate. `handle` is invoked
 * only for events whose origin `matches` accepts; data validation stays the
 * handler's responsibility. Every matching route fires (routes are
 * independent integrations, not a first-match chain).
 */
export function onTrustedMessage(matches: OriginMatcher, handle: TrustedMessageHandler): void {
  routes.push({ matches, handle });
  if (!isListening) {
    isListening = true;
    window.addEventListener('message', dispatch);
  }
}

/**
 * Exact-match origin allowlist. Prefer this over prefix/suffix patterns:
 * an exact set can't be fooled by lookalike hosts such as
 * https://www.opentable.evil.com.
 */
export function exactOrigins(...origins: string[]): OriginMatcher {
  const allowlist: ReadonlySet<string> = new Set(origins);
  return (origin) => allowlist.has(origin);
}
