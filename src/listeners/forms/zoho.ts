import { sendFynchEvent } from '../../utilities/send-fynch-event';
import { FORM_LEAD } from '../../utilities/constants';

const ZOHO_ORIGIN_PATTERN = /^https:\/\/forms\.zohopublic\.(com|eu|in|com\.au|com\.cn|jp|sa)$/;

export function register(): void {
  window.addEventListener('message', (event: MessageEvent) => {
    if (!ZOHO_ORIGIN_PATTERN.test(event.origin)) return;
    if (typeof event.data !== 'string') return;

    const parts = event.data.split('|');
    if (parts.length < 2) return;

    const [permalink, heightStr] = parts;
    if (!permalink || !Number.isFinite(Number(heightStr))) return;

    sendFynchEvent(FORM_LEAD, {
      provider: 'zoho',
      form_id: permalink,
    });
  });
}
