import { sendFynchEvent } from '../../utilities/send-fynch-event';
import { CHAT_STARTED } from '../../utilities/constants';

export function register(): boolean {
  if (typeof window.Beacon !== 'function') return false;
  // 'chat-started' is Help Scout's documented chat-start event
  // (https://developer.helpscout.com/beacon-2/web/javascript-api/); 'once'
  // caps it at one start_chat per page load, matching the other chat
  // integrations.
  window.Beacon('once', 'chat-started', () => {
    sendFynchEvent(CHAT_STARTED, {
      provider: 'beacon',
    });
  });
  return true;
}
