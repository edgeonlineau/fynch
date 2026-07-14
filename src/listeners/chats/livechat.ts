import { sendFynchEvent, nonEmptyString } from '../../utilities/send-fynch-event';
import { CHAT_STARTED } from '../../utilities/constants';

export function register(): boolean {
  if (typeof window.LiveChatWidget?.on !== 'function') {
    return false;
  }
  let hasStarted = false;
  window.LiveChatWidget.on('new_event', (event) => {
    if (hasStarted || event?.author?.type !== 'customer') {
      return;
    }
    hasStarted = true;
    sendFynchEvent(CHAT_STARTED, {
      provider: 'livechat',
      lead_id: nonEmptyString(event.author.id),
    });
  });
  return true;
}
