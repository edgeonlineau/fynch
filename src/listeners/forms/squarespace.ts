import { sendFynchEvent } from '../../utilities/send-fynch-event';
import { FORM_LEAD } from '../../utilities/constants';

const SUBMIT_TIMEOUT_MS = 5000;

// Squarespace renders form blocks inside one of these wrappers (7.0 and 7.1),
// and swaps the success message in within the same wrapper. Scoping to the
// wrapper keeps unrelated submit buttons (search widgets, other plugins) from
// arming the observer, and a stray .form-submission-text elsewhere on the
// page from firing a false lead.
const FORM_CONTAINER_SELECTOR = '.form-wrapper, .sqs-block-form, [data-block-type="9"]';

export function register(): void {
  let timeoutId: ReturnType<typeof setTimeout> | undefined;
  let container: Element | undefined;

  // Only observe the DOM while a submission is pending: a permanent
  // subtree observer would run for every mutation on every page.
  const observer = new MutationObserver(() => {
    if (!container || container.querySelector('.form-submission-text') === null) return;
    stopWatching();
    sendFynchEvent(FORM_LEAD, {
      provider: 'squarespace',
    });
  });

  function stopWatching(): void {
    observer.disconnect();
    clearTimeout(timeoutId);
    container = undefined;
  }

  document.addEventListener(
    'click',
    (event: MouseEvent) => {
      const target = event.target;
      if (
        !(target instanceof HTMLElement) ||
        !target.matches('input[type=submit], button[type=submit]')
      ) {
        return;
      }
      const formContainer = target.closest(FORM_CONTAINER_SELECTOR);
      if (!formContainer) return;

      stopWatching();
      container = formContainer;
      observer.observe(formContainer, { childList: true, subtree: true });
      timeoutId = setTimeout(stopWatching, SUBMIT_TIMEOUT_MS);
    },
    { capture: true, passive: true },
  );
}
