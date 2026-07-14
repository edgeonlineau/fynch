import { sendFynchEvent, nonEmptyString } from '../../utilities/send-fynch-event';
import { FORM_LEAD } from '../../utilities/constants';
import type { NinjaFormsResponse } from '../../types/types';

export function register($: JQueryStatic): void {
  $(document).on('nfFormSubmitResponse', (_event: unknown, response: unknown) => {
    if (typeof response === 'object' && response !== null && 'id' in response) {
      const resp = response as NinjaFormsResponse;
      sendFynchEvent(FORM_LEAD, {
        provider: 'ninja-forms',
        form_id: String(resp.id ?? ''),
        lead_id: nonEmptyString(
          resp.response?.data?.actions?.save?.entry_id ?? resp.response?.data?.id,
        ),
        form_name: nonEmptyString(resp.response?.data?.settings?.title),
      });
    }
  });
}
