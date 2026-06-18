import { sendFynchEvent } from '../../utilities/send-fynch-event';
import { FORM_LEAD } from '../../utilities/constants';

export function register(): void {
  window.addEventListener('message', (event: MessageEvent) => {
    if (event.data.type === 'hsFormCallback' && event.data.eventName === 'onFormSubmitted') {
      const formId = String(event.data?.id ?? '');
      const leadId = String(event.data.data?.submissionGuid ?? '') || undefined;
      sendFynchEvent(FORM_LEAD, {
        provider: 'hubspot-v3',
        form_id: formId,
        ...(leadId && { lead_id: leadId }),
      });
    }
  });
}
