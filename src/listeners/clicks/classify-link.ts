import type { EventParams } from '../../utilities/send-fynch-event';
import {
  type FynchEventAction,
  CLICK_OUTBOUND,
  CLICK_DOWNLOAD,
  CLICK_DIRECTIONS,
  CLICK_MESSAGING,
  CLICK_APP_STORE,
  CLICK_CALENDAR,
  DOWNLOAD_EXTENSIONS,
  MESSAGING_HOSTS,
  APP_STORE_HOSTS,
  CALENDAR_HOSTS,
} from '../../utilities/constants';

export interface LinkClassification {
  readonly action: FynchEventAction;
  readonly params: EventParams;
}

function normaliseHost(hostname: string): string {
  return hostname
    .toLowerCase()
    .replace(/\.$/, '')
    .replace(/^www\./, '');
}

function matchesHost(host: string, candidate: string): boolean {
  return host === candidate || host.endsWith('.' + candidate);
}

function extractFileInfo(pathname: string): { file_name: string; file_extension: string } | null {
  const lastSegment = pathname.split('/').pop();
  if (!lastSegment) return null;
  const dotIndex = lastSegment.lastIndexOf('.');
  if (dotIndex < 0) return null;
  return {
    file_name: lastSegment,
    file_extension: lastSegment.slice(dotIndex + 1),
  };
}

// Directions use path-dependent and wildcard-TLD shapes, so they stay as logic
// rather than a flat host table.
function classifyDirections(host: string, path: string): EventParams | null {
  if (matchesHost(host, 'g.page')) return { provider: 'google-business' };
  if (matchesHost(host, 'maps.apple.com')) return { provider: 'apple' };
  if (matchesHost(host, 'waze.com')) return { provider: 'waze' };
  if (host === 'maps.google.com' || host.startsWith('maps.google.')) {
    return { provider: 'google' };
  }
  if (matchesHost(host, 'goo.gl') && path.startsWith('/maps')) {
    return { provider: 'google' };
  }
  // google.com/maps, google.co.uk/maps, etc.
  if (/^google\.[a-z.]+$/.test(host) && path.startsWith('/maps')) {
    return { provider: 'google' };
  }
  return null;
}

function classifyCalendar(host: string, path: string): EventParams | null {
  if (path.endsWith('.ics')) return { provider: 'ics' };
  for (const [calendarHost, provider] of Object.entries(CALENDAR_HOSTS)) {
    if (!matchesHost(host, calendarHost)) continue;
    if (
      calendarHost === 'calendar.google.com' &&
      !(path.includes('/render') || path.includes('/event'))
    ) {
      continue;
    }
    return { provider };
  }
  return null;
}

/**
 * Classify an http(s) link URL into an intent event. Returns only the
 * type-specific params; the caller merges in base click context. Scheme-based
 * links (mailto/tel/sms/whatsapp/maps) are handled by the click handler, not here.
 */
export function classifyLink(url: URL): LinkClassification | null {
  const host = normaliseHost(url.hostname);
  const path = url.pathname.toLowerCase();

  // Calendar before download so .ics links are owned here, not by the extension list.
  const calendar = classifyCalendar(host, path);
  if (calendar) return { action: CLICK_CALENDAR, params: calendar };

  if (DOWNLOAD_EXTENSIONS.some((ext) => path.endsWith(ext))) {
    const fileInfo = extractFileInfo(url.pathname);
    return {
      action: CLICK_DOWNLOAD,
      params: fileInfo
        ? { file_name: fileInfo.file_name, file_extension: fileInfo.file_extension }
        : {},
    };
  }

  const directions = classifyDirections(host, path);
  if (directions) return { action: CLICK_DIRECTIONS, params: directions };

  for (const [messagingHost, channel] of Object.entries(MESSAGING_HOSTS)) {
    if (matchesHost(host, messagingHost)) {
      return { action: CLICK_MESSAGING, params: { provider: channel } };
    }
  }

  for (const [storeHost, store] of Object.entries(APP_STORE_HOSTS)) {
    if (matchesHost(host, storeHost)) {
      return { action: CLICK_APP_STORE, params: { provider: store } };
    }
  }

  if (
    (url.protocol === 'http:' || url.protocol === 'https:') &&
    url.hostname !== window.location.hostname
  ) {
    return { action: CLICK_OUTBOUND, params: { link_domain: url.hostname } };
  }

  return null;
}
