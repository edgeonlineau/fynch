import { sendFynchEvent } from '../../utilities/send-fynch-event';
import { CHAT_STARTED } from '../../utilities/constants';
import { chainCallback } from '../../utilities/chain-callback';

export function register(): void {
  window.Tawk_API = window.Tawk_API || {};
  window.Tawk_API.onChatStarted = chainCallback(window.Tawk_API.onChatStarted, () => {
    sendFynchEvent(CHAT_STARTED, {
      provider: 'tawk',
    });
  });
}
