import { sendFynchEvent } from '../../utilities/send-fynch-event';
import { BOOKING_SCHEDULED } from '../../utilities/constants';

export function register(): boolean {
  if (typeof window.crmForm === 'undefined') return false;

  const existingCallback = window.crmForm.callback;
  window.crmForm.callback = (leadId: string) => {
    if (typeof existingCallback === 'function') {
      existingCallback(leadId);
    }
    sendFynchEvent(BOOKING_SCHEDULED, {
      provider: 'lineleader',
      lead_id: leadId,
    });
  };
  return true;
}
