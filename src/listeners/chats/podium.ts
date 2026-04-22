import { sendFynchEvent } from '../../utilities/send-fynch-event';
import { CHAT_STARTED } from '../../utilities/constants';

export function register(): void {
  const existingCallback = window.PodiumEventsCallback;
  window.PodiumEventsCallback = (event: string, properties: Record<string, string>) => {
    if (typeof existingCallback === 'function') {
      existingCallback(event, properties);
    }
    if (event === 'Conversation Started') {
      sendFynchEvent(CHAT_STARTED, 'Podium Chat', {
        platform: 'podium',
      });
    }
  };
}
