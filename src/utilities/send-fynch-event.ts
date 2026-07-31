import { FORM_LEAD, type FynchEventAction } from './constants';
import { deriveContext } from './derive-context';
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
  FynchEventData,
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

  // A single roll-up of the event's most identifying value, so a GA4 setup can
  // map one `fynch.context` dimension instead of one per param.
  const context = deriveContext(action, params);

  const fynch: FynchEventData = {
    action,
    ...(context !== undefined ? { context } : {}),
    ...buildPageContext(),
    ...params,
  };

  // Clear any persisted `fynch` object first. GTM's data model recursively
  // merges and retains pushed values across events, so without this a prior
  // event's params (e.g. link_url) would linger and bleed into this one when
  // read as a Data Layer Variable. Mirrors GA4's `ecommerce: null` reset. The
  // reset carries no `event` key, so it updates the model without firing a
  // trigger.
  dataLayer.push({ fynch: null });

  // The event name carries the action (e.g. `fynch.click_to_call`) so each
  // event is distinct in GTM's Preview/Tag Assistant summary and triggerable
  // by an exact Custom Event name; `^fynch\.` matches them all. `action` lives
  // inside the `fynch` namespace so nothing collides with other dataLayer
  // producers at the top level.
  dataLayer.push({ event: `fynch.${action}`, fynch });
}
