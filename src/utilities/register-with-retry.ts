const POLL_INTERVAL_MS = 500;
const MAX_POLL_ATTEMPTS = 20; // ~10s of polling after window load

type RegisterAttempt = () => boolean;

interface PendingRegistration {
  retry: () => boolean;
  remaining: number;
}

// A single shared interval services every pending registration. With one
// timer instead of one per caller, N concurrent registrations (jQuery, chat
// and booking widgets, etc.) cost one scheduler wake-up per tick rather
// than N.
const pending: PendingRegistration[] = [];
let sharedTimer: ReturnType<typeof setInterval> | undefined;

function pollPending(): void {
  for (let i = pending.length - 1; i >= 0; i--) {
    const registration = pending[i];
    registration.remaining -= 1;
    if (registration.retry() || registration.remaining <= 0) {
      pending.splice(i, 1);
    }
  }
  if (pending.length === 0 && sharedTimer !== undefined) {
    clearInterval(sharedTimer);
    sharedTimer = undefined;
  }
}

function enqueuePolling(retry: () => boolean, remaining: number): void {
  pending.push({ retry, remaining });
  if (sharedTimer === undefined) {
    sharedTimer = setInterval(pollPending, POLL_INTERVAL_MS);
  }
}

/**
 * Run a registration attempt that depends on a third-party global (jQuery, a
 * chat widget, etc). If the global is not available yet, retry at
 * DOMContentLoaded, at window load, and then on a short capped poll. This lets
 * the fynch script be loaded early (or with defer/async) without caring about
 * script order relative to the platforms it integrates with.
 */
export function registerWithRetry(
  attempt: RegisterAttempt,
  pollAttempts: number = MAX_POLL_ATTEMPTS,
): void {
  if (attempt()) return;

  let done = false;
  const retry = (): boolean => {
    if (!done && attempt()) done = true;
    return done;
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => void retry(), { once: true });
  }

  const startPolling = (): void => {
    if (retry() || pollAttempts <= 0) return;
    enqueuePolling(retry, pollAttempts);
  };

  if (document.readyState === 'complete') {
    startPolling();
  } else {
    window.addEventListener('load', startPolling, { once: true });
  }
}
