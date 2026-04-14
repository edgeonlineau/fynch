import { sendFynchEvent } from '../../utilities/send-fynch-event';
import { FORM_LEAD } from '../../utilities/constants';

export function register($: JQueryStatic): void {
  $(document).on('wsf-submit-success', (_event: unknown, _formObject: unknown, formId: unknown) => {
    sendFynchEvent(FORM_LEAD, `WS Form ID: ${String(formId)}`);
  });
}
