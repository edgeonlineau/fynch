import { sendFynchEvent } from '../../utilities/send-fynch-event';
import { FORM_LEAD_EVENT } from '../../utilities/constants';

if (typeof jQuery === 'function') {
  jQuery(document).on(
    'wsf-submit-success',
    function (_event: unknown, _formObject: unknown, formId: unknown) {
      sendFynchEvent(FORM_LEAD_EVENT, `WS Form ID: ${String(formId)}`);
    },
  );
}
