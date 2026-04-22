import { sendFynchEvent } from '../../utilities/send-fynch-event';
import { BOOKING_SCHEDULED } from '../../utilities/constants';

const OPENTABLE_ORIGIN_PATTERN = /^https:\/\/www\.opentable\./;

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
        platform: 'opentable',
      });
    }
  });
}
