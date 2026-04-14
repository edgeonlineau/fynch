import { sendFynchEvent } from '../../utilities/send-fynch-event';
import { FORM_LEAD_EVENT } from '../../utilities/constants';
import type { JQueryEvent } from '../../types/types';

if (typeof jQuery === 'function') {
  jQuery(document).on('submit_success', function (event: unknown) {
    // SAFETY: jQuery wraps native event; target is the form element
    const jqEvent = event as JQueryEvent;
    const target = jqEvent.target as HTMLFormElement | null;
    sendFynchEvent(FORM_LEAD_EVENT, `Elementor Form: ${target?.name}`);
  });
}
