import { sendFynchEvent } from '../../utilities/send-fynch-event';
import { FORM_LEAD } from '../../utilities/constants';
import type { JQueryEvent } from '../../types/types';

export function register($: JQueryStatic): void {
  $(document).on('wpformsAjaxSubmitSuccess', (event: unknown) => {
    const jqEvent = event as JQueryEvent;
    const target = jqEvent.target;
    if (target instanceof Element) {
      const formId = target.getAttribute('data-formid') ?? '';
      const nativeEvent = jqEvent.originalEvent;
      const formName =
        nativeEvent instanceof CustomEvent ? String(nativeEvent.detail?.formName ?? '') : '';
      sendFynchEvent(FORM_LEAD, {
        service_provider: 'wp-forms',
        form_id: formId,
        ...(formName && { form_name: formName }),
      });
    }
  });
}
