import { sendFynchEvent, nonEmptyString } from '../../utilities/send-fynch-event';
import { FORM_LEAD } from '../../utilities/constants';
import { onTrustedMessage } from '../../utilities/message-dispatcher';

// Embedded typeforms live on form.typeform.com or a branded *.typeform.com
// subdomain, so the whole (Typeform-controlled) subdomain space is accepted.
// Restricting to form.typeform.com would break branded-subdomain customers.
// Lowercase-only on purpose: browsers serialise MessageEvent.origin in
// canonical (lowercase-host) form.
const TYPEFORM_ORIGIN_PATTERN = /^https:\/\/([a-z0-9-]+\.)?typeform\.com$/;

export function register(): void {
  onTrustedMessage(
    (origin) => TYPEFORM_ORIGIN_PATTERN.test(origin),
    (event) => {
      if (
        typeof event.data === 'object' &&
        event.data !== null &&
        'type' in event.data &&
        event.data.type === 'form-submit' &&
        'formId' in event.data
      ) {
        sendFynchEvent(FORM_LEAD, {
          provider: 'typeform',
          form_id: String(event.data.formId),
          lead_id: 'responseId' in event.data ? nonEmptyString(event.data.responseId) : undefined,
        });
      }
    },
  );
}
