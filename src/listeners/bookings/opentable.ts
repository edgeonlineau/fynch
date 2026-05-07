import { sendFynchEvent } from '../../utilities/send-fynch-event';
import { BOOKING_SCHEDULED } from '../../utilities/constants';

const OPENTABLE_ORIGIN_PATTERN = /^https:\/\/www\.opentable\./;

// TODO Add custom events for APP_READY > open_table_find_table and APP_CLOSED > open_table_closed

export function register(): void {
  window.addEventListener('message', (event: MessageEvent) => {
    if (
      OPENTABLE_ORIGIN_PATTERN.test(event.origin) &&
      typeof event.data === 'object' &&
      event.data !== null &&
      'type' in event.data &&
      event.data.type === 'reservation-made'
    ) {
      sendFynchEvent(BOOKING_SCHEDULED, 'OpenTable Reservation', {
        service_provider: 'opentable',
      });
    }
  });
}
