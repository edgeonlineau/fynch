import { sendFynchEvent } from '../../utilities/send-fynch-event';
import { BOOKING_SCHEDULED } from '../../utilities/constants';
import { onTrustedMessage, exactOrigins } from '../../utilities/message-dispatcher';

export function register(): void {
  onTrustedMessage(exactOrigins('https://calendly.com'), (event) => {
    if (
      typeof event.data === 'object' &&
      event.data !== null &&
      'event' in event.data &&
      event.data.event === 'calendly.event_scheduled'
    ) {
      sendFynchEvent(BOOKING_SCHEDULED, {
        provider: 'calendly',
      });
    }
  });
}
