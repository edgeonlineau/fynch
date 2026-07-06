import { sendFynchEvent } from '../../utilities/send-fynch-event';
import { BOOKING_SCHEDULED } from '../../utilities/constants';

// Exact-match origin allowlist. A prefix pattern such as /^https:\/\/www\.opentable\./
// would also accept attacker-controlled origins like https://www.opentable.evil.com.
const OPENTABLE_ORIGINS: ReadonlySet<string> = new Set([
  'https://www.opentable.com',
  'https://www.opentable.ca',
  'https://www.opentable.co.uk',
  'https://www.opentable.com.au',
  'https://www.opentable.com.mx',
  'https://www.opentable.de',
  'https://www.opentable.ie',
  'https://www.opentable.it',
  'https://www.opentable.jp',
  'https://www.opentable.nl',
  'https://www.opentable.sg',
  'https://www.opentable.hk',
]);

// TODO Add custom events for APP_READY > open_table_find_table and APP_CLOSED > open_table_closed

export function register(): void {
  window.addEventListener('message', (event: MessageEvent) => {
    if (
      OPENTABLE_ORIGINS.has(event.origin) &&
      typeof event.data === 'object' &&
      event.data !== null &&
      'type' in event.data &&
      event.data.type === 'reservation-made'
    ) {
      const leadId = String(event.data.confirmation_number ?? '') || undefined;
      sendFynchEvent(BOOKING_SCHEDULED, {
        provider: 'opentable',
        ...(leadId && { lead_id: leadId }),
      });
    }
  });
}
