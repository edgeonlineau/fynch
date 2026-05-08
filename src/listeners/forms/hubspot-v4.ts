import { sendFynchEvent } from '../../utilities/send-fynch-event';
import { FORM_LEAD } from '../../utilities/constants';

export function register(): void {
  window.addEventListener('hs-form-event:on-submission:success', (event: Event) => {
    if (typeof HubspotFormsV4 === 'undefined') return;
    const hsform = HubspotFormsV4.getFormFromEvent(event);
    if (hsform) {
      const formId = hsform.getFormId();
      sendFynchEvent(FORM_LEAD, {
        service_provider: 'hubspot-v4',
        form_id: formId,
      });
    }
  });
}
