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

// Reduce a phone number to digits only so every on-page formatting of one number
// (`07 5598 2622`, `(07) 5598-2622`, `0755982622`) collapses to a single value a
// plain GTM Lookup Table can key on. National and international forms of the same
// number don't merge (`07…` → `0755982622` vs `+61…` → `61755982622`) — that needs
// country-aware logic and is out of scope for a zero-config script.
function normalisePhone(value: string | undefined): string | undefined {
  if (value === undefined) return undefined;
  return value.replace(/\D+/g, '') || undefined;
}

// Lower-case and trim an email so casing/whitespace variants collapse to one value.
function normaliseEmail(value: string | undefined): string | undefined {
  if (value === undefined) return undefined;
  return value.trim().toLowerCase() || undefined;
}

/**
 * The single most identifying value for an event, duplicated into `fynch.context`
 * so a GA4 setup can surface every Fynch event through one custom dimension
 * instead of registering one per param. Composite values join with " | " and
 * drop absent parts.
 *
 * For contact clicks the value is normalised (phone → digits, email → lower-cased)
 * so a plain GTM Lookup Table can map it; `link_url` keeps the as-authored value
 * for auditing. It is still PII as far as GA4 is concerned — see the README's
 * context section for the Lookup Table sanitisation to apply before it reaches GA4.
 */
export function deriveContext(
  action: FynchEventAction,
  params: EventParams | undefined,
): string | undefined {
  const p = params ?? {};

  switch (action) {
    case CLICK_EMAIL:
      return normaliseEmail(p.link_url);
    case CLICK_PHONE:
    case CLICK_SMS:
      return normalisePhone(p.link_url);
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
