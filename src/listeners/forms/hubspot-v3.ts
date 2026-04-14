import { sendFynchEvent } from '../../utilities/send-fynch-event';
import { FORM_LEAD_EVENT } from '../../utilities/constants';

function handleHubSpotV3(event: MessageEvent): void {
  if (event.data.type === 'hsFormCallback' && event.data.eventName === 'onFormSubmitted') {
    sendFynchEvent(FORM_LEAD_EVENT, `HubSpot Form ID: ${event.data?.id}`);
  }
}

window.addEventListener('message', handleHubSpotV3);
