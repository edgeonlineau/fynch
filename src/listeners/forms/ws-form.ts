import { sendFynchEvent, nonEmptyString } from '../../utilities/send-fynch-event';
import { FORM_LEAD } from '../../utilities/constants';

export function register($: JQueryStatic): void {
  $(document).on('wsf-submit-success', (_event: unknown, formObject: unknown, formId: unknown) => {
    const isObj = typeof formObject === 'object' && formObject !== null;
    sendFynchEvent(FORM_LEAD, {
      provider: 'ws-form',
      form_id: String(formId),
      lead_id:
        isObj && 'submission_id' in formObject
          ? nonEmptyString((formObject as { submission_id?: string }).submission_id)
          : undefined,
      form_name:
        isObj && 'settings' in formObject
          ? nonEmptyString((formObject as { settings?: { title?: string } }).settings?.title)
          : undefined,
    });
  });
}
