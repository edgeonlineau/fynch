import { sendFynchEvent } from '../../utilities/send-fynch-event';
import { FORM_LEAD_EVENT } from '../../utilities/constants';

if (typeof dmAPI !== 'undefined') {
  dmAPI.subscribeEvent(dmAPI.EVENTS.FORM_SUBMISSION, function () {
    sendFynchEvent(FORM_LEAD_EVENT, `Duda Form`);
  });
}
