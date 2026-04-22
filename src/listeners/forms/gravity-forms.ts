import { sendFynchEvent } from '../../utilities/send-fynch-event';
import { FORM_LEAD } from '../../utilities/constants';

export function register($: JQueryStatic): void {
  $(document).on('gform_confirmation_loaded', (_event: unknown, formId: unknown) => {
    const id = String(formId);
    sendFynchEvent(FORM_LEAD, `Gravity Forms ID: ${id}`, {
      platform: 'gravity-forms',
      form_name: id,
    });
  });
}
