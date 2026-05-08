import { sendFynchEvent } from '../../utilities/send-fynch-event';
import { FORM_LEAD } from '../../utilities/constants';

const KNOWN_FORM_SELECTORS = [
  '[data-formid]',
  '[data-form-id]',
  '.wpcf7-form',
  '.hs-form',
  '.elementor-form',
  '.frm-fluent-form',
  '.forminator-custom-form',
  '.nf-form-cont',
  '.wpforms-form',
  '.wsf-form',
  '.et_pb_contact_form',
  '.gform_wrapper form',
] as const;

function isKnownForm(form: HTMLFormElement): boolean {
  return KNOWN_FORM_SELECTORS.some((selector) => form.matches(selector) || form.closest(selector));
}

export function register(): void {
  document.addEventListener(
    'submit',
    (event: SubmitEvent) => {
      const form = event.target;
      if (!(form instanceof HTMLFormElement)) return;
      if (isKnownForm(form)) return;

      const formName = form.getAttribute('name') || undefined;
      const formId = form.getAttribute('id') || undefined;
      sendFynchEvent(FORM_LEAD, {
        service_provider: 'generic',
        ...(formId && { form_id: formId }),
        ...(formName && { form_name: formName }),
      });
    },
    { capture: true },
  );
}
