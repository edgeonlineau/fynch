import { sendFynchEvent } from '../../utilities/send-fynch-event';
import { FORM_LEAD } from '../../utilities/constants';
import type { NinjaFormsResponse } from '../../types/types';

export function register($: JQueryStatic): void {
  $(document).on('nfFormSubmitResponse', (_event: unknown, response: unknown) => {
    if (typeof response === 'object' && response !== null && 'id' in response) {
      const resp = response as NinjaFormsResponse;
      const formId = String(resp.id ?? '');
      const leadId =
        String(resp.response?.data?.actions?.save?.entry_id ?? resp.response?.data?.id ?? '') ||
        undefined;
      const formName = String(resp.response?.data?.settings?.title ?? '') || undefined;
      sendFynchEvent(FORM_LEAD, {
        service_provider: 'ninja-forms',
        form_id: formId,
        ...(leadId && { lead_id: leadId }),
        ...(formName && { form_name: formName }),
      });
    }
  });
}
