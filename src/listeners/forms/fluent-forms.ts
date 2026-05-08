import { sendFynchEvent } from '../../utilities/send-fynch-event';
import { FORM_LEAD } from '../../utilities/constants';
import type { JQueryEvent, FluentFormsData } from '../../types/types';

export function register($: JQueryStatic): void {
  $(document).on('fluentform_submission_success', (event: unknown, data: unknown) => {
    const jqEvent = event as JQueryEvent;
    if (
      typeof jqEvent.originalEvent === 'undefined' &&
      typeof data === 'object' &&
      data !== null &&
      'config' in data
    ) {
      const formId = String((data as FluentFormsData).config?.id ?? '');
      const leadId = String((data as FluentFormsData).response?.data?.entry_id ?? '') || undefined;
      const formName =
        document
          .getElementById(`fluentform_${formId}`)
          ?.closest('.fluentform-wrapper')
          ?.querySelector('.fluentform-title')
          ?.textContent?.trim() ?? '';
      sendFynchEvent(FORM_LEAD, {
        service_provider: 'fluent-forms',
        form_id: formId,
        ...(leadId && { lead_id: leadId }),
        ...(formName && { form_name: formName }),
      });
    }
  });
}
