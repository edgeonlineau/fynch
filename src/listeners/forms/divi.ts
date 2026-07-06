import { sendFynchEvent } from '../../utilities/send-fynch-event';
import { FORM_LEAD } from '../../utilities/constants';
import type { JQueryXhr, JQueryAjaxSettings } from '../../types/types';

export function register($: JQueryStatic): void {
  $(document).on('ajaxSuccess', (_event: unknown, xhr: unknown, req: unknown, data: unknown) => {
    const jqXhr = xhr as JQueryXhr;
    const jqReq = req as JQueryAjaxSettings;
    // Cheap checks first: this handler fires for every jQuery AJAX response on the page.
    if (jqReq.url !== window.location.href || jqReq.type !== 'POST' || jqXhr.status !== 200) {
      return;
    }
    if (typeof jqReq.data !== 'string' || !jqReq.data.includes('et_pb_contactform')) {
      return;
    }
    if (typeof data !== 'string') return;

    // DOMParser is inert: unlike jQuery's HTML parsing it neither executes
    // scripts nor fetches subresources referenced by the response markup.
    const responseDoc = new DOMParser().parseFromString(data, 'text/html');
    if (responseDoc.querySelector('.et_pb_contact_error_text')) return;

    sendFynchEvent(FORM_LEAD, {
      provider: 'divi',
    });
  });
}
