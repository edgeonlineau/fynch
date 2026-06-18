import type { FynchEventAction } from './constants';

window.dataLayer = window.dataLayer || [];

export interface EventParams {
  readonly service_provider?: string;
  readonly form_id?: string;
  readonly form_name?: string;
  readonly lead_id?: string;
  readonly link_url?: string;
  readonly link_text?: string;
  readonly link_id?: string;
  readonly link_classes?: string;
  readonly link_domain?: string;
  readonly map_provider?: string;
  readonly messaging_channel?: string;
  readonly app_store?: string;
  readonly calendar_provider?: string;
  readonly file_name?: string;
  readonly file_extension?: string;
  readonly percent_scrolled?: number;
}

const DEDUP_WINDOW_MS = 500;
let lastEventKey = '';
let lastEventTime = 0;

function isDuplicate(action: FynchEventAction, params?: EventParams): boolean {
  const key = params ? `${action}::${JSON.stringify(params)}` : action;
  const now = Date.now();
  if (key === lastEventKey && now - lastEventTime < DEDUP_WINDOW_MS) {
    return true;
  }
  lastEventKey = key;
  lastEventTime = now;
  return false;
}

function buildPageContext(): Pick<
  DataLayerEvent,
  'page_url' | 'page_title' | 'page_path' | 'referrer' | 'timestamp'
> {
  return {
    page_url: window.location.href,
    page_title: document.title,
    page_path: window.location.pathname,
    referrer: document.referrer,
    timestamp: new Date().toISOString(),
  };
}

export function sendFynchEvent(action: FynchEventAction, params?: EventParams): void {
  if (isDuplicate(action, params)) return;

  const event: DataLayerEvent = {
    event: 'fynch.event',
    action,
    ...buildPageContext(),
    ...params,
  };

  dataLayer.push(event);
}
