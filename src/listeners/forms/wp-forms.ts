import { sendFynchEvent } from '../../utilities/send-fynch-event';
import { FORM_LEAD } from '../../utilities/constants';
import type { JQueryEvent } from '../../types/types';

export function register($: JQueryStatic): void {
  $(document).on('wpformsAjaxSubmitSuccess', (event: unknown) => {
    const target = (event as JQueryEvent).target;
    if (target instanceof Element) {
      const formId = target.getAttribute('data-formid') ?? '';
      sendFynchEvent(FORM_LEAD, {
        service_provider: 'wp-forms',
        form_id: formId,
      });
    }
  });
}
