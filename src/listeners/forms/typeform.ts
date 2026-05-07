import { sendFynchEvent } from '../../utilities/send-fynch-event';
import { FORM_LEAD } from '../../utilities/constants';

export function register(): void {
  window.addEventListener('message', (event: MessageEvent) => {
    if (
      typeof event.data === 'object' &&
      event.data !== null &&
      'type' in event.data &&
      event.data.type === 'form-submit' &&
      'formId' in event.data
    ) {
      const formId = String(event.data.formId);
      sendFynchEvent(FORM_LEAD, `Typeform ID: ${formId}`, {
        service_provider: 'typeform',
        form_id: formId,
      });
    }
  });
}
