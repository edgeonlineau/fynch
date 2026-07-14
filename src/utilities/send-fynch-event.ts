import { FORM_LEAD, type FynchEventAction } from './constants';
import { isFormDuplicate } from './form-dedup';

window.dataLayer = window.dataLayer || [];

export interface EventParams {
  readonly provider?: string;
  readonly form_id?: string;
  readonly form_name?: string;
  readonly lead_id?: string;
  readonly link_url?: string;
  readonly link_text?: string;
  readonly link_id?: string;
  readonly link_classes?: string;
  readonly link_domain?: string;
  readonly file_name?: string;
  readonly file_extension?: string;
  readonly percent_scrolled?: number;
}

/**
 * Coerce an untrusted payload field to a string, treating missing values and
 * empty strings as absent. Pairs with sendFynchEvent's undefined-stripping so
 * call sites can write `lead_id: nonEmptyString(data.bookingId)` without
 * conditional spreads.
 */
export function nonEmptyString(value: unknown): string | undefined {
  const str = String(value ?? '');
  return str || undefined;
}

function compactParams(params: EventParams): EventParams {
  return Object.fromEntries(
    Object.entries(params).filter(([, value]) => value !== undefined),
  ) as EventParams;
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

export function sendFynchEvent(action: FynchEventAction, rawParams?: EventParams): void {
  // Undefined-valued fields never reach the dataLayer, so call sites can
  // pass optional extractions directly instead of conditionally spreading.
  const params = rawParams && compactParams(rawParams);
  if (action === FORM_LEAD && params && isFormDuplicate(params)) return;
  if (isDuplicate(action, params)) return;

  const event: DataLayerEvent = {
    event: 'fynch.event',
    action,
    ...buildPageContext(),
    ...params,
  };

  dataLayer.push(event);
}
