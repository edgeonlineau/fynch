import { sendFynchEvent } from '../../utilities/send-fynch-event';
import { FORM_LEAD } from '../../utilities/constants';
import type { JQueryEvent } from '../../types/types';

export function register($: JQueryStatic): void {
  $(document).on('submit_success', (event: unknown) => {
    const target = (event as JQueryEvent).target as HTMLFormElement | null;
    const formIdInput = target?.querySelector('input[name="form_id"]') as HTMLInputElement | null;
    const formId = formIdInput?.value ?? '';
    const formNameInput = target?.querySelector(
      'input[name="form_name"]',
    ) as HTMLInputElement | null;
    const formName = formNameInput?.value ?? target?.name ?? '';
    sendFynchEvent(FORM_LEAD, {
      provider: 'elementor',
      ...(formId && { form_id: formId }),
      form_name: formName,
    });
  });
}
