import { sendFynchEvent } from '../../utilities/send-fynch-event';
import { FORM_LEAD } from '../../utilities/constants';

export function register(): void {
  document.addEventListener('wpcf7mailsent', (event: Event) => {
    if (!(event instanceof CustomEvent)) return;
    sendFynchEvent(FORM_LEAD, `Contact Form 7 ID: ${event.detail?.contactFormId}`);
  });
}
