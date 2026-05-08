import { sendFynchEvent } from '../../utilities/send-fynch-event';
import { FORM_LEAD } from '../../utilities/constants';

export function register($: JQueryStatic): void {
  $(document).on('wsf-submit-success', (_event: unknown, _formObject: unknown, formId: unknown) => {
    const id = String(formId);
    sendFynchEvent(FORM_LEAD, {
      service_provider: 'ws-form',
      form_id: id,
    });
  });
}
