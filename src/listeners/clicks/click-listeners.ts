import { sendFynchEvent } from '../../utilities/send-fynch-event';
import {
  CLICK_EMAIL,
  CLICK_PHONE,
  CLICK_SMS,
  CLICK_OUTBOUND,
  CLICK_DOWNLOAD,
  DOWNLOAD_EXTENSIONS,
} from '../../utilities/constants';

function findAnchorFromTarget(target: EventTarget | null): HTMLAnchorElement | null {
  let current = target;
  while (current instanceof HTMLElement) {
    if (current instanceof HTMLAnchorElement) return current;
    current = current.parentElement;
  }
  return null;
}

function isDownloadLink(pathname: string): boolean {
  const lower = pathname.toLowerCase();
  return DOWNLOAD_EXTENSIONS.some((ext) => lower.endsWith(ext));
}

function isOutboundLink(href: string): boolean {
  try {
    const url = new URL(href);
    return (
      (url.protocol === 'http:' || url.protocol === 'https:') &&
      url.hostname !== window.location.hostname
    );
  } catch {
    return false;
  }
}

function handleClick(event: MouseEvent): void {
  const anchor = findAnchorFromTarget(event.target);
  if (!anchor) return;

  const href = anchor.href;
  let url: URL;
  try {
    url = new URL(href);
  } catch {
    return;
  }

  switch (url.protocol) {
    case 'mailto:':
      sendFynchEvent(CLICK_EMAIL, url.pathname);
      return;
    case 'tel:':
    case 'callto:':
      sendFynchEvent(CLICK_PHONE, url.pathname);
      return;
    case 'sms:':
      sendFynchEvent(CLICK_SMS, url.pathname);
      return;
  }

  if (isDownloadLink(url.pathname)) {
    sendFynchEvent(CLICK_DOWNLOAD, url.pathname);
    return;
  }

  if (isOutboundLink(href)) {
    sendFynchEvent(CLICK_OUTBOUND, url.href);
  }
}

document.addEventListener('click', handleClick, { capture: true, passive: true });
