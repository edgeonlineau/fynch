import { sendFynchEvent } from '../../utilities/send-fynch-event';
import { FORM_LEAD } from '../../utilities/constants';

export function register($: JQueryStatic): void {
  $(document).on('frmFormComplete', (_event: unknown, form: unknown) => {
    const label = $(form as string)
      .find('.frm_screen_reader')
      ?.text();
    sendFynchEvent(FORM_LEAD, {
      provider: 'formidable',
      form_name: label,
    });
  });
}
