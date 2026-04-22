import { sendFynchEvent } from '../../utilities/send-fynch-event';
import { BOOKING_SCHEDULED } from '../../utilities/constants';

export function register(): void {
  window.addEventListener('message', (event: MessageEvent) => {
    if (event.origin !== 'https://bookings.nowbookit.com') return;
    if (typeof event.data !== 'string') return;

    let data: { type?: string; event?: { event_action?: string } } | undefined;
    try {
      data = JSON.parse(event.data);
    } catch {
      return;
    }

    if (
      data?.type === 'NBIWidget2GoogleAnalytics' &&
      data.event?.event_action === 'Booking Confirmed'
    ) {
      sendFynchEvent(BOOKING_SCHEDULED, 'NowBookIt Booking', {
        platform: 'nowbookit',
      });
    }
  });
}
