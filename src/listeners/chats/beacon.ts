import { sendFynchEvent } from '../../utilities/send-fynch-event';
import { CHAT_STARTED } from '../../utilities/constants';

export function register(): boolean {
  if (typeof window.Beacon !== 'function') return false;
  window.Beacon('once', 'ai-answers-response', () => {
    sendFynchEvent(CHAT_STARTED, {
      provider: 'beacon',
    });
  });
  return true;
}
