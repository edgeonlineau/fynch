import { sendFynchEvent } from '../../utilities/send-fynch-event';
import { FORM_LEAD_EVENT } from '../../utilities/constants';

if (typeof jQuery === 'function') {
  jQuery(document).on('frmFormComplete', function (_event: unknown, form: unknown) {
    // SAFETY: Formidable Forms passes a jQuery selector string for the completed form
    const label = jQuery(form as string)
      .find('.frm_screen_reader')
      ?.text();
    sendFynchEvent(FORM_LEAD_EVENT, `Formidable Forms: ${label}`);
  });
}
