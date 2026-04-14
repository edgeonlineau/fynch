import { sendFynchEvent } from '../../utilities/send-fynch-event';
import { FORM_LEAD } from '../../utilities/constants';

export function register(): void {
  window.addEventListener('message', (event: MessageEvent) => {
    if (event.data.type === 'hsFormCallback' && event.data.eventName === 'onFormSubmitted') {
      sendFynchEvent(FORM_LEAD, `HubSpot Form ID: ${event.data?.id}`);
    }
  });
}
