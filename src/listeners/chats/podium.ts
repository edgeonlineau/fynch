import { sendFynchEvent, nonEmptyString } from '../../utilities/send-fynch-event';
import { CHAT_STARTED } from '../../utilities/constants';
import { chainCallback } from '../../utilities/chain-callback';

export function register(): void {
  window.PodiumEventsCallback = chainCallback(
    window.PodiumEventsCallback,
    (event: string, properties: Record<string, string>) => {
      if (event === 'Conversation Started') {
        sendFynchEvent(CHAT_STARTED, {
          provider: 'podium',
          lead_id: nonEmptyString(properties.uid || properties.conversationUid),
        });
      }
    },
  );
}
