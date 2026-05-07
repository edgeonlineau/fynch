import { sendFynchEvent } from '../../utilities/send-fynch-event';
import { BOOKING_SCHEDULED } from '../../utilities/constants';

export function register(): void {
  if (typeof window.crmForm === 'undefined') return;

  const existingCallback = window.crmForm.callback;
  window.crmForm.callback = (leadId: string) => {
    if (typeof existingCallback === 'function') {
      existingCallback(leadId);
    }
    sendFynchEvent(BOOKING_SCHEDULED, `LineLeader Tour: ${leadId}`, {
      service_provider: 'lineleader',
    });
  };
}
