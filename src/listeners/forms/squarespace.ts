import { sendFynchEvent } from '../../utilities/send-fynch-event';
import { FORM_LEAD } from '../../utilities/constants';

const SUBMIT_TIMEOUT_MS = 5000;

export function register(): void {
  let timeoutId: ReturnType<typeof setTimeout> | undefined;

  // Only observe the DOM while a submission is pending: a permanent
  // subtree observer on <body> would run for every mutation on every page.
  const observer = new MutationObserver(() => {
    if (document.querySelector('.form-submission-text') === null) return;
    stopWatching();
    sendFynchEvent(FORM_LEAD, {
      provider: 'squarespace',
    });
  });

  function stopWatching(): void {
    observer.disconnect();
    clearTimeout(timeoutId);
  }

  document.addEventListener(
    'click',
    (event: MouseEvent) => {
      const target = event.target;
      if (!(target instanceof HTMLElement) || !target.matches('input[type=submit]')) return;
      if (!document.body) return;

      clearTimeout(timeoutId);
      observer.observe(document.body, { childList: true, subtree: true });
      timeoutId = setTimeout(stopWatching, SUBMIT_TIMEOUT_MS);
    },
    { capture: true, passive: true },
  );
}
