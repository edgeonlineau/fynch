const POLL_INTERVAL_MS = 500;
const MAX_POLL_ATTEMPTS = 20; // ~10s of polling after window load

type RegisterAttempt = () => boolean;

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
    let remaining = pollAttempts;
    const timer = setInterval(() => {
      remaining -= 1;
      if (retry() || remaining <= 0) clearInterval(timer);
    }, POLL_INTERVAL_MS);
  };

  if (document.readyState === 'complete') {
    startPolling();
  } else {
    window.addEventListener('load', startPolling, { once: true });
  }
}
