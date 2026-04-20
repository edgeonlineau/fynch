import { sendFynchEvent } from '../../utilities/send-fynch-event';
import { FORM_LEAD } from '../../utilities/constants';

export function register(): void {
  document.addEventListener('wpcf7mailsent', (event: Event) => {
    if (!(event instanceof CustomEvent)) return;
    const formId = String(event.detail?.contactFormId ?? '');
    sendFynchEvent(FORM_LEAD, `Contact Form 7 ID: ${formId}`, {
      form_platform: 'contact-form-7',
      form_name: formId,
    });
  });
}
