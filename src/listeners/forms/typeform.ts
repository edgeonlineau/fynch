import { sendFynchEvent } from '../../utilities/send-fynch-event';
import { FORM_LEAD } from '../../utilities/constants';

// Embedded typeforms live on form.typeform.com or a branded *.typeform.com
// subdomain, so the whole (Typeform-controlled) subdomain space is accepted.
// Restricting to form.typeform.com would break branded-subdomain customers.
const TYPEFORM_ORIGIN_PATTERN = /^https:\/\/([a-z0-9-]+\.)?typeform\.com$/;

export function register(): void {
  window.addEventListener('message', (event: MessageEvent) => {
    if (!TYPEFORM_ORIGIN_PATTERN.test(event.origin)) return;
    if (
      typeof event.data === 'object' &&
      event.data !== null &&
      'type' in event.data &&
      event.data.type === 'form-submit' &&
      'formId' in event.data
    ) {
      const formId = String(event.data.formId);
      const leadId =
        'responseId' in event.data ? String(event.data.responseId) || undefined : undefined;
      sendFynchEvent(FORM_LEAD, {
        provider: 'typeform',
        form_id: formId,
        ...(leadId && { lead_id: leadId }),
      });
    }
  });
}
