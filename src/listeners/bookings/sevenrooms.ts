import { sendFynchEvent } from '../../utilities/send-fynch-event';
import { BOOKING_SCHEDULED } from '../../utilities/constants';
import { onTrustedMessage, exactOrigins } from '../../utilities/message-dispatcher';

export function register(): void {
  onTrustedMessage(exactOrigins('https://www.sevenrooms.com'), (event) => {
    if (
      typeof event.data === 'object' &&
      event.data !== null &&
      'type' in event.data &&
      event.data.type === 'reservation'
    ) {
      sendFynchEvent(BOOKING_SCHEDULED, {
        provider: 'sevenrooms',
      });
    }
  });
}
