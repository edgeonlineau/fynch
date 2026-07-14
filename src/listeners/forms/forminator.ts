import { sendFynchEvent, nonEmptyString } from '../../utilities/send-fynch-event';
import { FORM_LEAD } from '../../utilities/constants';
import type { JQueryEvent } from '../../types/types';

export function register($: JQueryStatic): void {
  $(document).on('forminator:form:submit:success', (event: unknown, data: unknown) => {
    const target = (event as JQueryEvent).target;
    if (target instanceof Element) {
      const formId = target.getAttribute('data-form-id') ?? '';
      sendFynchEvent(FORM_LEAD, {
        provider: 'forminator',
        form_id: formId,
        form_name:
          typeof data === 'object' && data !== null && 'formName' in data
            ? nonEmptyString((data as { formName?: string }).formName)
            : undefined,
      });
    }
  });
}
