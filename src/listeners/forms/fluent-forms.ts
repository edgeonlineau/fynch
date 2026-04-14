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
      sendFynchEvent(FORM_LEAD, `Fluent Forms ID: ${(data as FluentFormsData).config?.id}`);
    }
  });
}
