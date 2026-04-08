import sendFynchEvent from "../send-fynch-event";
import {FORM_LEAD_EVENT} from "../constants";

/* Contact Forms 7 */
document.addEventListener('wpcf7mailsent', function(event) {
  sendFynchEvent(FORM_LEAD_EVENT, `Contact Form 7 ID: ${(event as CustomEvent).detail?.contactFormId}`);
});

/* Divi Forms */
typeof jQuery === 'function' && jQuery(document).on("ajaxSuccess", (_event: any, xhr: any, req: any, data: any) => {
  const reqData = Object.fromEntries(new URLSearchParams(req.data));

  if (
    // check if this is a divi request
    req.url === window.location.href &&
    req.type === "POST" &&
    // check if the data sent is for a contact form
    Object.keys(reqData).some((key) => key.startsWith("et_pb_contactform")) &&
    // check if the server response is valid
    xhr.status === 200 &&
    // check if the server didn't return an error message
    !jQuery!(data).find(".et_pb_contact_error_text").length
  ) {
    sendFynchEvent(FORM_LEAD_EVENT, `Divi Form`);
  }
});

/* Duda Form */
typeof dmAPI !== 'undefined' && dmAPI.subscribeEvent(dmAPI.EVENTS.FORM_SUBMISSION, function() {
  sendFynchEvent(FORM_LEAD_EVENT, `Duda Form`);
});

/* Elementor Forms */
typeof jQuery === 'function' && jQuery(document).on('submit_success', function(event: any) {
  sendFynchEvent(FORM_LEAD_EVENT, `Elementor Form: ${event.target.name}`);
});

/* FluentForms Forms */
typeof jQuery === 'function' && jQuery(document).on("fluentform_submission_success", function(event: any, data: any) {
  if (typeof event.originalEvent === "undefined") {
    sendFynchEvent(FORM_LEAD_EVENT, `Fluent Forms ID: ${data?.config?.id}`);
  }
});

/* Formidable Forms */
typeof jQuery === 'function' && jQuery(document).on('frmFormComplete', function(_event: any, form: any) {
  sendFynchEvent(FORM_LEAD_EVENT, `Formidable Forms: ${jQuery!(form).find('.frm_screen_reader')?.text()}`);
});

/* Forminator Forms */
typeof jQuery === 'function' && jQuery(document).on('forminator:form:submit:success', function(event: any) {
  sendFynchEvent(FORM_LEAD_EVENT, `Forminator Forms ID: ${event.target.getAttribute('data-form-id')}`);
});

/* HubSpot Forms (v3) */
window.addEventListener("message", function(event: MessageEvent) {
  if(event.data.type === 'hsFormCallback' && event.data.eventName === 'onFormSubmitted') {
    sendFynchEvent(FORM_LEAD_EVENT, `HubSpot Form ID: ${event.data?.id}`);
  }
});

/* HubSpot Forms (v4) */
window.addEventListener("hs-form-event:on-submission:success", function(event) {
  const hsform = HubspotFormsV4.getFormFromEvent(event);
  if (hsform) {
    sendFynchEvent(FORM_LEAD_EVENT, `HubSpot Form ID: ${hsform.getFormId()}`);
  }
});

/* Ninja Forms */
typeof jQuery === 'function' && jQuery(document).on("nfFormSubmitResponse", function(_event: any, response: any) {
  sendFynchEvent(FORM_LEAD_EVENT, `Ninja Forms ID: ${response?.id}`);
});

/* WP Forms */
typeof jQuery === 'function' && jQuery(document).on("wpformsAjaxSubmitSuccess", function(event: any) {
  sendFynchEvent(FORM_LEAD_EVENT, `WP Forms ID: ${event.target.getAttribute('data-formid')}`);
});

/* WS Form */
typeof jQuery === 'function' && jQuery(document).on("wsf-submit-success", function(_event: any, _form_object: any, form_id: any) {
  sendFynchEvent(FORM_LEAD_EVENT, `WS Form ID: ${form_id}`);
});
