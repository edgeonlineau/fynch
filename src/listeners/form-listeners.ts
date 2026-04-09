import sendFynchEvent from '../send-fynch-event';
import { FORM_LEAD_EVENT } from '../constants';

interface JQueryXhr {
  status: number;
}

interface JQueryAjaxSettings {
  url: string;
  type: string;
  data: string;
}

interface JQueryEvent {
  target: EventTarget | null;
  originalEvent?: Event;
}

/* Contact Forms 7 */
document.addEventListener('wpcf7mailsent', function (event) {
  sendFynchEvent(
    FORM_LEAD_EVENT,
    `Contact Form 7 ID: ${(event as CustomEvent).detail?.contactFormId}`,
  );
});

/* Divi Forms */
if (typeof jQuery === 'function') {
  jQuery(document).on(
    'ajaxSuccess',
    (_event: unknown, xhr: unknown, req: unknown, data: unknown) => {
      const jqXhr = xhr as JQueryXhr;
      const jqReq = req as JQueryAjaxSettings;
      const reqData = Object.fromEntries(new URLSearchParams(jqReq.data));

      if (
        jqReq.url === window.location.href &&
        jqReq.type === 'POST' &&
        Object.keys(reqData).some((key) => key.startsWith('et_pb_contactform')) &&
        jqXhr.status === 200 &&
        typeof jQuery === 'function' &&
        !jQuery(data as string).find('.et_pb_contact_error_text').length
      ) {
        sendFynchEvent(FORM_LEAD_EVENT, `Divi Form`);
      }
    },
  );
}

/* Duda Form */
if (typeof dmAPI !== 'undefined') {
  dmAPI.subscribeEvent(dmAPI.EVENTS.FORM_SUBMISSION, function () {
    sendFynchEvent(FORM_LEAD_EVENT, `Duda Form`);
  });
}

/* Elementor Forms */
if (typeof jQuery === 'function') {
  jQuery(document).on('submit_success', function (event: unknown) {
    const jqEvent = event as JQueryEvent;
    const target = jqEvent.target as HTMLFormElement | null;
    sendFynchEvent(FORM_LEAD_EVENT, `Elementor Form: ${target?.name}`);
  });
}

/* FluentForms Forms */
if (typeof jQuery === 'function') {
  jQuery(document).on('fluentform_submission_success', function (event: unknown, data: unknown) {
    const jqEvent = event as JQueryEvent;
    if (typeof jqEvent.originalEvent === 'undefined') {
      const config = (data as { config?: { id?: string } })?.config;
      sendFynchEvent(FORM_LEAD_EVENT, `Fluent Forms ID: ${config?.id}`);
    }
  });
}

/* Formidable Forms */
if (typeof jQuery === 'function') {
  jQuery(document).on('frmFormComplete', function (_event: unknown, form: unknown) {
    const label = jQuery(form as string)
      .find('.frm_screen_reader')
      ?.text();
    sendFynchEvent(FORM_LEAD_EVENT, `Formidable Forms: ${label}`);
  });
}

/* Forminator Forms */
if (typeof jQuery === 'function') {
  jQuery(document).on('forminator:form:submit:success', function (event: unknown) {
    const jqEvent = event as JQueryEvent;
    const target = jqEvent.target as Element | null;
    sendFynchEvent(FORM_LEAD_EVENT, `Forminator Forms ID: ${target?.getAttribute('data-form-id')}`);
  });
}

/* HubSpot Forms (v3) */
window.addEventListener('message', function (event: MessageEvent) {
  if (event.data.type === 'hsFormCallback' && event.data.eventName === 'onFormSubmitted') {
    sendFynchEvent(FORM_LEAD_EVENT, `HubSpot Form ID: ${event.data?.id}`);
  }
});

/* HubSpot Forms (v4) */
window.addEventListener('hs-form-event:on-submission:success', function (event) {
  const hsform = HubspotFormsV4.getFormFromEvent(event);
  if (hsform) {
    sendFynchEvent(FORM_LEAD_EVENT, `HubSpot Form ID: ${hsform.getFormId()}`);
  }
});

/* Ninja Forms */
if (typeof jQuery === 'function') {
  jQuery(document).on('nfFormSubmitResponse', function (_event: unknown, response: unknown) {
    const data = response as { id?: string };
    sendFynchEvent(FORM_LEAD_EVENT, `Ninja Forms ID: ${data?.id}`);
  });
}

/* WP Forms */
if (typeof jQuery === 'function') {
  jQuery(document).on('wpformsAjaxSubmitSuccess', function (event: unknown) {
    const jqEvent = event as JQueryEvent;
    const target = jqEvent.target as Element | null;
    sendFynchEvent(FORM_LEAD_EVENT, `WP Forms ID: ${target?.getAttribute('data-formid')}`);
  });
}

/* WS Form */
if (typeof jQuery === 'function') {
  jQuery(document).on(
    'wsf-submit-success',
    function (_event: unknown, _form_object: unknown, form_id: unknown) {
      sendFynchEvent(FORM_LEAD_EVENT, `WS Form ID: ${form_id}`);
    },
  );
}
