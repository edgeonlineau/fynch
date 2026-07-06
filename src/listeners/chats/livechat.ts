import { sendFynchEvent } from '../../utilities/send-fynch-event';
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
    const leadId = event.author.id || undefined;
    sendFynchEvent(CHAT_STARTED, {
      provider: 'livechat',
      ...(leadId && { lead_id: leadId }),
    });
  });
  return true;
}
