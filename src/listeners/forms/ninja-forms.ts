import { sendFynchEvent } from '../../utilities/send-fynch-event';
import { FORM_LEAD } from '../../utilities/constants';

export function register($: JQueryStatic): void {
  $(document).on('nfFormSubmitResponse', (_event: unknown, response: unknown) => {
    if (typeof response === 'object' && response !== null && 'id' in response) {
      sendFynchEvent(FORM_LEAD, `Ninja Forms ID: ${(response as { id?: string }).id}`);
    }
  });
}
