import { sendFynchEvent } from '../../utilities/send-fynch-event';
import { BOOKING_SCHEDULED } from '../../utilities/constants';
import { chainCallback } from '../../utilities/chain-callback';

export function register(): boolean {
  if (typeof window.crmForm === 'undefined') return false;

  window.crmForm.callback = chainCallback(window.crmForm.callback, (leadId: string) => {
    sendFynchEvent(BOOKING_SCHEDULED, {
      provider: 'lineleader',
      lead_id: leadId,
    });
  });
  return true;
}
