import { sendFynchEvent } from '../../utilities/send-fynch-event';
import { FORM_LEAD_EVENT } from '../../utilities/constants';
import type { JQueryEvent } from '../../types/types';

if (typeof jQuery === 'function') {
  jQuery(document).on('forminator:form:submit:success', function (event: unknown) {
    const jqEvent = event as JQueryEvent;
    const target = jqEvent.target;
    if (target instanceof Element) {
      sendFynchEvent(
        FORM_LEAD_EVENT,
        `Forminator Forms ID: ${target.getAttribute('data-form-id')}`,
      );
    }
  });
}
