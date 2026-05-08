import { sendFynchEvent } from '../../utilities/send-fynch-event';
import { FORM_LEAD } from '../../utilities/constants';

export function register($: JQueryStatic): void {
  $(document).on('wsf-submit-success', (_event: unknown, formObject: unknown, formId: unknown) => {
    const id = String(formId);
    const isObj = typeof formObject === 'object' && formObject !== null;
    const leadId =
      isObj && 'submission_id' in formObject
        ? String((formObject as { submission_id?: string }).submission_id ?? '') || undefined
        : undefined;
    const formName =
      isObj && 'settings' in formObject
        ? String((formObject as { settings?: { title?: string } }).settings?.title ?? '') ||
          undefined
        : undefined;
    sendFynchEvent(FORM_LEAD, {
      service_provider: 'ws-form',
      form_id: id,
      ...(leadId && { lead_id: leadId }),
      ...(formName && { form_name: formName }),
    });
  });
}
