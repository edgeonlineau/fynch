import { sendFynchEvent } from '../../utilities/send-fynch-event';
import { FORM_LEAD } from '../../utilities/constants';

export function register(): boolean {
  if (typeof dmAPI === 'undefined') return false;
  dmAPI.subscribeEvent(dmAPI.EVENTS.FORM_SUBMISSION, () => {
    sendFynchEvent(FORM_LEAD, {
      provider: 'duda',
    });
  });
  return true;
}
