import { sendFynchEvent } from '../../utilities/send-fynch-event';
import { FORM_LEAD } from '../../utilities/constants';
import { exactOrigins, onTrustedMessage } from '../../utilities/message-dispatcher';

export function register(): void {
  onTrustedMessage(exactOrigins('https://forms.monday.com'), (event) => {
    const data = event.data;
    if (
      typeof data === 'object' &&
      data !== null &&
      data.source === 'workforms' &&
      data.type === 'submit_success'
    ) {
      sendFynchEvent(FORM_LEAD, { provider: 'monday' });
    }
  });
}
