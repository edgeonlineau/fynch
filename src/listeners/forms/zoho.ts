import { sendFynchEvent } from '../../utilities/send-fynch-event';
import { FORM_LEAD, MAX_FORM_ID_LENGTH } from '../../utilities/constants';

// Lowercase-only on purpose: browsers serialise MessageEvent.origin in
// canonical (lowercase-host) form.
const ZOHO_ORIGIN_PATTERN = /^https:\/\/forms\.zohopublic\.(com|eu|in|com\.au|com\.cn|jp|sa)$/;

export function register(): void {
  window.addEventListener('message', (event: MessageEvent) => {
    if (!ZOHO_ORIGIN_PATTERN.test(event.origin)) return;
    if (typeof event.data !== 'string') return;

    const parts = event.data.split('|');
    if (parts.length < 2) return;

    const [permalink, heightStr] = parts;
    if (!permalink || !Number.isFinite(Number(heightStr))) return;
    // Defence in depth: real Zoho permalinks are short slugs, so an
    // oversized value means a malformed (or hostile) frame — drop it rather
    // than push arbitrary-length data into the dataLayer.
    if (permalink.length > MAX_FORM_ID_LENGTH) return;

    sendFynchEvent(FORM_LEAD, {
      provider: 'zoho',
      form_id: permalink,
    });
  });
}
