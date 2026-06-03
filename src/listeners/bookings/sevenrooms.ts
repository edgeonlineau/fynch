import { sendFynchEvent } from '../../utilities/send-fynch-event';
import { BOOKING_SCHEDULED } from '../../utilities/constants';

export function register(): void {
  window.addEventListener('message', (event: MessageEvent) => {
    if (
      event.origin === 'https://www.sevenrooms.com' &&
      typeof event.data === 'object' &&
      event.data !== null &&
      'type' in event.data &&
      event.data.type === 'reservation'
    ) {
      sendFynchEvent(BOOKING_SCHEDULED, {
        service_provider: 'sevenrooms',
      });
    }
  });
}
