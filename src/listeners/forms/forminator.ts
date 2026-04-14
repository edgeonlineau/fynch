import { sendFynchEvent } from '../../utilities/send-fynch-event';
import { FORM_LEAD } from '../../utilities/constants';
import type { JQueryEvent } from '../../types/types';

export function register($: JQueryStatic): void {
  $(document).on('forminator:form:submit:success', (event: unknown) => {
    const target = (event as JQueryEvent).target;
    if (target instanceof Element) {
      sendFynchEvent(FORM_LEAD, `Forminator Forms ID: ${target.getAttribute('data-form-id')}`);
    }
  });
}
