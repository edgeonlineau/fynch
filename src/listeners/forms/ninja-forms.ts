import { sendFynchEvent } from '../../utilities/send-fynch-event';
import { FORM_LEAD_EVENT } from '../../utilities/constants';
import { isNinjaFormsResponse } from '../../types/type-guards';

if (typeof jQuery === 'function') {
  jQuery(document).on('nfFormSubmitResponse', function (_event: unknown, response: unknown) {
    if (isNinjaFormsResponse(response)) {
      sendFynchEvent(FORM_LEAD_EVENT, `Ninja Forms ID: ${response.id}`);
    }
  });
}
