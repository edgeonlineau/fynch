import { sendFynchEvent } from '../../utilities/send-fynch-event';
import { CHAT_STARTED } from '../../utilities/constants';

export function register(): void {
  if (typeof window.Beacon === 'function') {
    window.Beacon('once', 'ai-answers-response', () => {
      sendFynchEvent(CHAT_STARTED, 'Beacon Chat', {
        platform: 'beacon',
      });
    });
  }
}
