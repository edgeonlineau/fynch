import { sendFynchEvent } from '../../utilities/send-fynch-event';
import { FORM_LEAD } from '../../utilities/constants';

export function register(): void {
  if (typeof dmAPI !== 'undefined') {
    dmAPI.subscribeEvent(dmAPI.EVENTS.FORM_SUBMISSION, () => {
      sendFynchEvent(FORM_LEAD, {
        provider: 'duda',
      });
    });
  }
}
