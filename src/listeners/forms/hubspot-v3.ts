import { sendFynchEvent, nonEmptyString } from '../../utilities/send-fynch-event';
import { FORM_LEAD } from '../../utilities/constants';
import { onTrustedMessage } from '../../utilities/message-dispatcher';

// v3 inline embeds post from the host page's own origin; iframe embeds post
// from a *.hsforms.com / *.hsforms.net origin.
// Lowercase-only on purpose: browsers serialise MessageEvent.origin in
// canonical (lowercase-host) form, so a case-insensitive flag would only
// widen the trust surface, never fix a real mismatch.
const HSFORMS_ORIGIN_PATTERN = /^https:\/\/[a-z0-9-]+\.hsforms\.(com|net)$/;

function isTrustedOrigin(origin: string): boolean {
  return origin === window.location.origin || HSFORMS_ORIGIN_PATTERN.test(origin);
}

export function register(): void {
  onTrustedMessage(isTrustedOrigin, (event) => {
    if (typeof event.data !== 'object' || event.data === null) return;
    if (event.data.type === 'hsFormCallback' && event.data.eventName === 'onFormSubmitted') {
      sendFynchEvent(FORM_LEAD, {
        provider: 'hubspot-v3',
        form_id: String(event.data.id ?? ''),
        lead_id: nonEmptyString(event.data.data?.submissionGuid),
      });
    }
  });
}
