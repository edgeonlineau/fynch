import { sendFynchEvent } from '../../utilities/send-fynch-event';
import { FORM_LEAD } from '../../utilities/constants';

export function register($: JQueryStatic): void {
  $(document).on('frmFormComplete', (_event: unknown, form: unknown) => {
    // Formidable passes the submitted <form> element (or a jQuery wrapper of
    // it), never a string. Reject non-objects so a string payload can never
    // reach $()'s HTML-parsing path.
    if (typeof form !== 'object' || form === null) return;
    const label = $(form as Element | JQuery)
      .find('.frm_screen_reader')
      .text();
    sendFynchEvent(FORM_LEAD, {
      provider: 'formidable',
      form_name: label,
    });
  });
}
