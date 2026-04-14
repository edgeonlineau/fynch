import { sendFynchEvent } from '../../utilities/send-fynch-event';
import { FORM_LEAD_EVENT } from '../../utilities/constants';

function handleHubSpotV4(event: Event): void {
  if (typeof HubspotFormsV4 === 'undefined') return;
  const hsform = HubspotFormsV4.getFormFromEvent(event);
  if (hsform) {
    sendFynchEvent(FORM_LEAD_EVENT, `HubSpot Form ID: ${hsform.getFormId()}`);
  }
}

window.addEventListener('hs-form-event:on-submission:success', handleHubSpotV4);
