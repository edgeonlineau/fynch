import { sendFynchEvent } from '../../utilities/send-fynch-event';
import { FORM_LEAD } from '../../utilities/constants';

export function register($: JQueryStatic): void {
  $(document).on('gform_confirmation_loaded', (_event: unknown, formId: unknown) => {
    const id = String(formId);
    const formName =
      document.getElementById(`gform_wrapper_${id}`)?.getAttribute('aria-label') ?? '';
    sendFynchEvent(FORM_LEAD, {
      service_provider: 'gravity-forms',
      form_id: id,
      ...(formName && { form_name: formName }),
    });
  });
}
