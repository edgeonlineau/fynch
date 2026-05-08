import { sendFynchEvent } from '../../utilities/send-fynch-event';
import { FORM_LEAD } from '../../utilities/constants';

export function register(): void {
  document.addEventListener('wpcf7mailsent', (event: Event) => {
    if (!(event instanceof CustomEvent)) return;
    const formId = String(event.detail?.contactFormId ?? '');
    const formName =
      document.querySelector(`[id^="wpcf7-f${formId}-"]`)?.getAttribute('data-name') ?? '';
    sendFynchEvent(FORM_LEAD, {
      service_provider: 'contact-form-7',
      form_id: formId,
      ...(formName && { form_name: formName }),
    });
  });
}
