import { sendFynchEvent } from '../../utilities/send-fynch-event';
import { FORM_LEAD_EVENT } from '../../utilities/constants';
import type { JQueryXhr, JQueryAjaxSettings } from '../../types/types';

if (typeof jQuery === 'function') {
  jQuery(document).on(
    'ajaxSuccess',
    (_event: unknown, xhr: unknown, req: unknown, data: unknown) => {
      // SAFETY: jQuery guarantees ajaxSuccess callback receives (event, jqXHR, ajaxSettings, data)
      const jqXhr = xhr as JQueryXhr;
      const jqReq = req as JQueryAjaxSettings;
      const reqData = Object.fromEntries(new URLSearchParams(jqReq.data));

      if (
        jqReq.url === window.location.href &&
        jqReq.type === 'POST' &&
        Object.keys(reqData).some((key) => key.startsWith('et_pb_contactform')) &&
        jqXhr.status === 200 &&
        typeof jQuery === 'function' &&
        // SAFETY: Divi returns HTML string as data in ajaxSuccess
        !jQuery(data as string).find('.et_pb_contact_error_text').length
      ) {
        sendFynchEvent(FORM_LEAD_EVENT, `Divi Form`);
      }
    },
  );
}
