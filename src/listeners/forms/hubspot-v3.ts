import { sendFynchEvent } from '../../utilities/send-fynch-event';
import { FORM_LEAD } from '../../utilities/constants';

export function register(): void {
  window.addEventListener('message', (event: MessageEvent) => {
    if (event.data.type === 'hsFormCallback' && event.data.eventName === 'onFormSubmitted') {
      const formId = String(event.data?.id ?? '');
      sendFynchEvent(FORM_LEAD, {
        service_provider: 'hubspot-v3',
        form_id: formId,
      });
    }
  });
}
