import { sendFynchEvent } from '../../utilities/send-fynch-event';
import { FORM_LEAD } from '../../utilities/constants';
import type { JQueryEvent } from '../../types/types';

export function register($: JQueryStatic): void {
  $(document).on('forminator:form:submit:success', (event: unknown) => {
    const target = (event as JQueryEvent).target;
    if (target instanceof Element) {
      const formId = target.getAttribute('data-form-id') ?? '';
      sendFynchEvent(FORM_LEAD, `Forminator Forms ID: ${formId}`, {
        form_platform: 'forminator',
        form_name: formId,
      });
    }
  });
}
