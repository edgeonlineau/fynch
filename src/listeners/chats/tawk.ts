import { sendFynchEvent } from '../../utilities/send-fynch-event';
import { CHAT_STARTED } from '../../utilities/constants';

export function register(): void {
  window.Tawk_API = window.Tawk_API || {};
  const existingCallback = window.Tawk_API.onChatStarted;
  window.Tawk_API.onChatStarted = () => {
    if (typeof existingCallback === 'function') {
      existingCallback();
    }
    sendFynchEvent(CHAT_STARTED, {
      provider: 'tawk',
    });
  };
}
