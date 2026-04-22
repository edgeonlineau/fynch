import { sendFynchEvent } from '../../utilities/send-fynch-event';
import { BOOKING_SCHEDULED } from '../../utilities/constants';

export function register(): void {
  window.addEventListener('message', (event: MessageEvent) => {
    if (
      event.origin === 'https://calendly.com' &&
      typeof event.data === 'object' &&
      event.data !== null &&
      'event' in event.data &&
      event.data.event === 'calendly.event_scheduled'
    ) {
      sendFynchEvent(BOOKING_SCHEDULED, 'Calendly Booking', {
        platform: 'calendly',
      });
    }
  });
}
