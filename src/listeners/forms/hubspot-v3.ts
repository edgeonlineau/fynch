import { sendFynchEvent } from '../../utilities/send-fynch-event';
import { FORM_LEAD } from '../../utilities/constants';

// v3 inline embeds post from the host page's own origin; iframe embeds post
// from a *.hsforms.com / *.hsforms.net origin.
const HSFORMS_ORIGIN_PATTERN = /^https:\/\/[a-z0-9-]+\.hsforms\.(com|net)$/;

function isTrustedOrigin(origin: string): boolean {
  return origin === window.location.origin || HSFORMS_ORIGIN_PATTERN.test(origin);
}

export function register(): void {
  window.addEventListener('message', (event: MessageEvent) => {
    if (!isTrustedOrigin(event.origin)) return;
    if (typeof event.data !== 'object' || event.data === null) return;
    if (event.data.type === 'hsFormCallback' && event.data.eventName === 'onFormSubmitted') {
      const formId = String(event.data.id ?? '');
      const leadId = String(event.data.data?.submissionGuid ?? '') || undefined;
      sendFynchEvent(FORM_LEAD, {
        provider: 'hubspot-v3',
        form_id: formId,
        ...(leadId && { lead_id: leadId }),
      });
    }
  });
}
