export const EVENTS = {
  CLICK_EMAIL: 'email_clicked',
  CLICK_PHONE: 'phone_clicked',
  CLICK_SMS: 'sms_clicked',
  FORM_LEAD: 'form_lead',
} as const;

export type FynchEventAction = (typeof EVENTS)[keyof typeof EVENTS];

export const CLICK_EMAIL_EVENT = EVENTS.CLICK_EMAIL;
export const CLICK_PHONE_EVENT = EVENTS.CLICK_PHONE;
export const CLICK_SMS_EVENT = EVENTS.CLICK_SMS;
export const FORM_LEAD_EVENT = EVENTS.FORM_LEAD;
