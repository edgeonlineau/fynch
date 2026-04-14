import { sendFynchEvent } from '../../utilities/send-fynch-event';
import { FORM_LEAD_EVENT } from '../../utilities/constants';
import { isCustomEvent } from '../../types/type-guards';

function handleContactForm7(event: Event): void {
  if (!isCustomEvent(event)) return;
  sendFynchEvent(FORM_LEAD_EVENT, `Contact Form 7 ID: ${event.detail?.contactFormId}`);
}

document.addEventListener('wpcf7mailsent', handleContactForm7);
