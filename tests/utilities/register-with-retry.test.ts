import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { registerWithRetry } from '../../src/utilities/register-with-retry';

function setReadyState(state: DocumentReadyState): void {
  Object.defineProperty(document, 'readyState', {
    value: state,
    writable: true,
    configurable: true,
  });
}

describe('registerWithRetry', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    setReadyState('complete');
  });

  it('does not schedule retries when the first attempt succeeds', () => {
    const attempt = vi.fn().mockReturnValue(true);

    registerWithRetry(attempt);

    vi.runAllTimers();
    expect(attempt).toHaveBeenCalledTimes(1);
  });

  it('retries at DOMContentLoaded while the document is still loading', () => {
    setReadyState('loading');
    const attempt = vi.fn().mockReturnValueOnce(false).mockReturnValue(true);

    registerWithRetry(attempt);
    expect(attempt).toHaveBeenCalledTimes(1);

    document.dispatchEvent(new Event('DOMContentLoaded'));
    expect(attempt).toHaveBeenCalledTimes(2);

    // Success at DOMContentLoaded means the load retry becomes a no-op.
    window.dispatchEvent(new Event('load'));
    vi.runAllTimers();
    expect(attempt).toHaveBeenCalledTimes(2);
  });

  it('retries at window load when the document is interactive', () => {
    setReadyState('interactive');
    const attempt = vi.fn().mockReturnValueOnce(false).mockReturnValue(true);

    registerWithRetry(attempt);
    expect(attempt).toHaveBeenCalledTimes(1);

    window.dispatchEvent(new Event('load'));
    expect(attempt).toHaveBeenCalledTimes(2);
  });

  it('polls after load until the attempt succeeds', () => {
    setReadyState('complete');
    const attempt = vi
      .fn()
      .mockReturnValueOnce(false)
      .mockReturnValueOnce(false)
      .mockReturnValueOnce(false)
      .mockReturnValue(true);

    registerWithRetry(attempt);

    vi.advanceTimersByTime(500);
    vi.advanceTimersByTime(500);
    expect(attempt).toHaveBeenCalledTimes(4);

    // Interval is cleared after success: no further attempts.
    vi.advanceTimersByTime(5000);
    expect(attempt).toHaveBeenCalledTimes(4);
  });

  it('stops polling after the attempt cap is reached', () => {
    setReadyState('complete');
    const attempt = vi.fn().mockReturnValue(false);

    registerWithRetry(attempt, 3);

    vi.advanceTimersByTime(60_000);
    // 1 initial + 1 pre-poll retry + 3 polled attempts.
    expect(attempt).toHaveBeenCalledTimes(5);
  });

  it('shares a single interval across concurrent registrations', () => {
    setReadyState('complete');
    const first = vi.fn().mockReturnValue(false);
    const second = vi.fn().mockReturnValue(false);

    registerWithRetry(first, 2);
    registerWithRetry(second, 4);

    // One shared setInterval, not one per registration.
    expect(vi.getTimerCount()).toBe(1);

    vi.advanceTimersByTime(60_000);
    // Each registration still honours its own attempt cap:
    // 1 initial + 1 pre-poll retry + N polled attempts.
    expect(first).toHaveBeenCalledTimes(4);
    expect(second).toHaveBeenCalledTimes(6);
    // Timer is released once nothing is pending.
    expect(vi.getTimerCount()).toBe(0);
  });

  it('keeps polling remaining registrations after one succeeds', () => {
    setReadyState('complete');
    const succeedsSecondPoll = vi
      .fn()
      .mockReturnValueOnce(false)
      .mockReturnValueOnce(false)
      .mockReturnValueOnce(false)
      .mockReturnValue(true);
    const neverSucceeds = vi.fn().mockReturnValue(false);

    registerWithRetry(succeedsSecondPoll, 5);
    registerWithRetry(neverSucceeds, 5);

    vi.advanceTimersByTime(60_000);
    expect(succeedsSecondPoll).toHaveBeenCalledTimes(4);
    // 1 initial + 1 pre-poll retry + 5 polled attempts.
    expect(neverSucceeds).toHaveBeenCalledTimes(7);
  });

  it('does not poll when pollAttempts is zero', () => {
    setReadyState('complete');
    const attempt = vi.fn().mockReturnValue(false);

    registerWithRetry(attempt, 0);

    vi.advanceTimersByTime(60_000);
    // 1 initial + 1 pre-poll retry.
    expect(attempt).toHaveBeenCalledTimes(2);
  });
});
