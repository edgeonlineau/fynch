import { sendFynchEvent } from '../../utilities/send-fynch-event';
import { FORM_LEAD } from '../../utilities/constants';
import type { JQueryEvent } from '../../types/types';

export function register($: JQueryStatic): void {
  $(document).on('submit_success', (event: unknown) => {
    const target = (event as JQueryEvent).target as HTMLFormElement | null;
    const formName = target?.name ?? '';
    sendFynchEvent(FORM_LEAD, `Elementor Form: ${formName}`, {
      form_platform: 'elementor',
      form_name: formName,
    });
  });
}
