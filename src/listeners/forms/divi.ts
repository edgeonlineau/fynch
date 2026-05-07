import { sendFynchEvent } from '../../utilities/send-fynch-event';
import { FORM_LEAD } from '../../utilities/constants';
import type { JQueryXhr, JQueryAjaxSettings } from '../../types/types';

export function register($: JQueryStatic): void {
  $(document).on('ajaxSuccess', (_event: unknown, xhr: unknown, req: unknown, data: unknown) => {
    const jqXhr = xhr as JQueryXhr;
    const jqReq = req as JQueryAjaxSettings;
    const reqData = Object.fromEntries(new URLSearchParams(jqReq.data));
    if (
      jqReq.url === window.location.href &&
      jqReq.type === 'POST' &&
      Object.keys(reqData).some((key) => key.startsWith('et_pb_contactform')) &&
      jqXhr.status === 200 &&
      !$(data as string).find('.et_pb_contact_error_text').length
    ) {
      sendFynchEvent(FORM_LEAD, 'Divi Form', {
        service_provider: 'divi',
      });
    }
  });
}
