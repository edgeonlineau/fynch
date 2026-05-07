import { sendFynchEvent } from '../../utilities/send-fynch-event';
import { FORM_LEAD } from '../../utilities/constants';

export function register(): void {
  window.addEventListener('message', (event: MessageEvent) => {
    if (typeof event.data !== 'string') return;

    let data: { type?: string; event?: string; selected_location?: string } | undefined;
    try {
      data = JSON.parse(event.data);
    } catch {
      return;
    }

    if (data?.type === 'IFRAME_DATA_LAYER_EVENT' && data.event === 'iframe_form_submission') {
      const location = data.selected_location ?? 'XAP Form';
      sendFynchEvent(FORM_LEAD, `XAP Form: ${location}`, {
        service_provider: 'xap',
        form_name: location,
      });
    }
  });
}
