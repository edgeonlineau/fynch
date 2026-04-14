export const CLICK_EMAIL = 'email_clicked' as const;
export const CLICK_PHONE = 'phone_clicked' as const;
export const CLICK_SMS = 'sms_clicked' as const;
export const FORM_LEAD = 'form_lead' as const;

export type FynchEventAction =
  | typeof CLICK_EMAIL
  | typeof CLICK_PHONE
  | typeof CLICK_SMS
  | typeof FORM_LEAD;
