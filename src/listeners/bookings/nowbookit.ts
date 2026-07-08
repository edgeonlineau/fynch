import { sendFynchEvent } from '../../utilities/send-fynch-event';
import { BOOKING_SCHEDULED } from '../../utilities/constants';
import { onTrustedMessage, exactOrigins } from '../../utilities/message-dispatcher';

export function register(): void {
  onTrustedMessage(exactOrigins('https://bookings.nowbookit.com'), (event) => {
    if (typeof event.data !== 'string') return;

    let data:
      | { type?: string; event?: { event_action?: string }; data?: { bookingId?: string } }
      | undefined;
    try {
      data = JSON.parse(event.data);
    } catch {
      return;
    }

    if (
      data?.type === 'NBIWidget2GoogleAnalytics' &&
      data.event?.event_action === 'Booking Confirmed'
    ) {
      const leadId = String(data?.data?.bookingId ?? '') || undefined;
      sendFynchEvent(BOOKING_SCHEDULED, {
        provider: 'nowbookit',
        ...(leadId && { lead_id: leadId }),
      });
    }
  });
}
