export const CLICK_EMAIL = 'click_to_email' as const;
export const CLICK_PHONE = 'click_to_call' as const;
export const CLICK_SMS = 'click_to_text' as const;
export const CLICK_OUTBOUND = 'outbound_click' as const;
export const CLICK_DOWNLOAD = 'download_file_click' as const;
export const CLICK_CTA = 'call_to_action_click' as const;
export const CLICK_DIRECTIONS = 'get_directions' as const;
export const CLICK_MESSAGING = 'click_to_message' as const;
export const CLICK_APP_STORE = 'app_store_click' as const;
export const CLICK_CALENDAR = 'add_to_calendar' as const;
export const FORM_LEAD = 'form_lead' as const;
export const SCROLL_MILESTONE = 'scroll_milestone' as const;
export const CHAT_STARTED = 'start_chat' as const;
export const BOOKING_SCHEDULED = 'schedule_booking' as const;

export type FynchEventAction =
  | typeof CLICK_EMAIL
  | typeof CLICK_PHONE
  | typeof CLICK_SMS
  | typeof CLICK_OUTBOUND
  | typeof CLICK_DOWNLOAD
  | typeof CLICK_CTA
  | typeof CLICK_DIRECTIONS
  | typeof CLICK_MESSAGING
  | typeof CLICK_APP_STORE
  | typeof CLICK_CALENDAR
  | typeof FORM_LEAD
  | typeof SCROLL_MILESTONE
  | typeof CHAT_STARTED
  | typeof BOOKING_SCHEDULED;

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

// Host (normalised: lowercased, www. and trailing dot stripped) -> provider value.
// Matched with host === key || host.endsWith('.' + key).
export const MESSAGING_HOSTS: Readonly<Record<string, string>> = {
  'wa.me': 'whatsapp',
  'api.whatsapp.com': 'whatsapp',
  'web.whatsapp.com': 'whatsapp',
  'm.me': 'messenger',
  'ig.me': 'instagram',
};

export const APP_STORE_HOSTS: Readonly<Record<string, string>> = {
  'apps.apple.com': 'apple',
  'itunes.apple.com': 'apple',
  'play.google.com': 'google',
};

// calendar.google.com additionally requires a /render or /event path (see classify-link).
export const CALENDAR_HOSTS: Readonly<Record<string, string>> = {
  'calendar.google.com': 'google',
  'outlook.live.com': 'outlook',
  'addtocalendar.com': 'addtocalendar',
  'addevent.com': 'addevent',
};
