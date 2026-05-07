import { sendFynchEvent } from '../../utilities/send-fynch-event';
import { CHAT_STARTED } from '../../utilities/constants';

export function register(): void {
  window.Tawk_API = window.Tawk_API || {};
  window.Tawk_API.onChatStarted = () => {
    sendFynchEvent(CHAT_STARTED, 'Tawk.to Chat', {
      service_provider: 'tawk',
    });
  };
}
