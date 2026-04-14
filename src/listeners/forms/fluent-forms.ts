import { sendFynchEvent } from '../../utilities/send-fynch-event';
import { FORM_LEAD_EVENT } from '../../utilities/constants';
import { isFluentFormsData } from '../../types/type-guards';
import type { JQueryEvent } from '../../types/types';

if (typeof jQuery === 'function') {
  jQuery(document).on('fluentform_submission_success', function (event: unknown, data: unknown) {
    const jqEvent = event as JQueryEvent;
    if (typeof jqEvent.originalEvent === 'undefined' && isFluentFormsData(data)) {
      sendFynchEvent(FORM_LEAD_EVENT, `Fluent Forms ID: ${data.config?.id}`);
    }
  });
}
