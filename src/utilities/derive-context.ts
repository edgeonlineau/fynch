import type { EventParams } from './send-fynch-event';
import {
  BOOKING_SCHEDULED,
  CHAT_STARTED,
  CLICK_APP_STORE,
  CLICK_CALENDAR,
  CLICK_CTA,
  CLICK_DIRECTIONS,
  CLICK_DOWNLOAD,
  CLICK_EMAIL,
  CLICK_MESSAGING,
  CLICK_OUTBOUND,
  CLICK_PHONE,
  CLICK_SMS,
  FORM_LEAD,
  SCROLL_MILESTONE,
  type FynchEventAction,
} from './constants';

// Join the present, non-empty parts of a composite context with " | " so a
// missing part never leaves a dangling separator (e.g. `example.com | `).
function joinParts(...parts: (string | undefined)[]): string | undefined {
  const present = parts.filter((part): part is string => typeof part === 'string' && part !== '');
  return present.length ? present.join(' | ') : undefined;
}

/**
 * The single most identifying value for an event, duplicated into `fynch.context`
 * so a GA4 setup can surface every Fynch event through one custom dimension
 * instead of registering one per param. Composite values join with " | " and
 * drop absent parts.
 *
 * Contact values (email, phone, messaging handles) are included deliberately, so
 * `context` for those actions is the raw address/number. That is PII as far as
 * GA4 is concerned — see the README's context section for why, and for the GTM
 * Lookup Table / RegEx Table sanitisation to apply before it reaches GA4.
 */
export function deriveContext(
  action: FynchEventAction,
  params: EventParams | undefined,
): string | undefined {
  const p = params ?? {};

  switch (action) {
    case CLICK_EMAIL:
    case CLICK_PHONE:
    case CLICK_SMS:
      return p.link_url;
    // Link clicks with a specific destination: the provider names the channel,
    // the link_url identifies the actual place/app/event/handle.
    case CLICK_MESSAGING:
    case CLICK_DIRECTIONS:
    case CLICK_APP_STORE:
    case CLICK_CALENDAR:
      return joinParts(p.provider, p.link_url);
    case CLICK_OUTBOUND:
      return joinParts(p.link_domain, p.link_text);
    case CLICK_CTA:
      return joinParts(p.link_text, p.link_url);
    case CLICK_DOWNLOAD:
      return p.file_name;
    case FORM_LEAD:
      return joinParts(p.provider, p.form_name ?? p.form_id);
    case SCROLL_MILESTONE:
      return p.percent_scrolled !== undefined ? String(p.percent_scrolled) : undefined;
    // Widget events with no link — the provider is the identifying value.
    case CHAT_STARTED:
    case BOOKING_SCHEDULED:
      return p.provider;
    default:
      return undefined;
  }
}
