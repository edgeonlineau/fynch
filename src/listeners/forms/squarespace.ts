import { sendFynchEvent } from '../../utilities/send-fynch-event';
import { FORM_LEAD } from '../../utilities/constants';

const SUBMIT_TIMEOUT_MS = 5000;

export function register(): void {
  let awaitingSubmission = false;
  let timeoutId: ReturnType<typeof setTimeout> | undefined;

  document.addEventListener(
    'click',
    (event: MouseEvent) => {
      const target = event.target;
      if (target instanceof HTMLElement && target.matches('input[type=submit]')) {
        awaitingSubmission = true;
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
          awaitingSubmission = false;
        }, SUBMIT_TIMEOUT_MS);
      }
    },
    { capture: true, passive: true },
  );

  const observer = new MutationObserver(() => {
    if (!awaitingSubmission) return;
    if (document.querySelector('.form-submission-text') === null) return;

    awaitingSubmission = false;
    clearTimeout(timeoutId);
    observer.disconnect();

    sendFynchEvent(FORM_LEAD, {
      service_provider: 'squarespace',
    });
  });

  observer.observe(document.body, { childList: true, subtree: true });
}
