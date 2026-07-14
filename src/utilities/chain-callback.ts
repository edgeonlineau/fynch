/**
 * Wrap a third-party global callback slot (Tawk_API.onChatStarted,
 * PodiumEventsCallback, crmForm.callback, ...): the returned function first
 * invokes whatever handler the host site had already installed, then `next`.
 * Integrations that take over host globals must never clobber the site's own
 * handler — this helper makes that the only way to write it.
 */
export function chainCallback<Args extends unknown[]>(
  existing: ((...args: Args) => void) | undefined,
  next: (...args: Args) => void,
): (...args: Args) => void {
  return (...args: Args) => {
    // Runtime check as well: the existing value comes from an untrusted
    // global and may not honour our type.
    if (typeof existing === 'function') {
      existing(...args);
    }
    next(...args);
  };
}
