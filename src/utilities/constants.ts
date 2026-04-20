export const CLICK_EMAIL = 'email_clicked' as const;
export const CLICK_PHONE = 'phone_clicked' as const;
export const CLICK_SMS = 'sms_clicked' as const;
export const CLICK_OUTBOUND = 'outbound_link_clicked' as const;
export const CLICK_DOWNLOAD = 'file_downloaded' as const;
export const CLICK_CTA = 'cta_clicked' as const;
export const FORM_LEAD = 'form_lead' as const;
export const SCROLL_MILESTONE = 'scroll_milestone' as const;

export type FynchEventAction =
  | typeof CLICK_EMAIL
  | typeof CLICK_PHONE
  | typeof CLICK_SMS
  | typeof CLICK_OUTBOUND
  | typeof CLICK_DOWNLOAD
  | typeof CLICK_CTA
  | typeof FORM_LEAD
  | typeof SCROLL_MILESTONE;

export const DOWNLOAD_EXTENSIONS = [
  '.pdf',
  '.doc',
  '.docx',
  '.xls',
  '.xlsx',
  '.csv',
  '.zip',
  '.rar',
  '.gz',
  '.tar',
  '.ppt',
  '.pptx',
  '.exe',
  '.dmg',
  '.apk',
] as const;
