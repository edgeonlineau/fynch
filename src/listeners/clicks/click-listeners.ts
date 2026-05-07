import { sendFynchEvent, type EventParams } from '../../utilities/send-fynch-event';
import {
  CLICK_EMAIL,
  CLICK_PHONE,
  CLICK_SMS,
  CLICK_OUTBOUND,
  CLICK_DOWNLOAD,
  DOWNLOAD_EXTENSIONS,
} from '../../utilities/constants';

const MAX_LINK_TEXT_LENGTH = 100;

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

function buildBaseClickContext(anchor: HTMLAnchorElement): EventParams {
  const text = anchor.textContent?.trim() ?? '';
  return {
    link_url: anchor.href,
    ...(text && { link_text: text.slice(0, MAX_LINK_TEXT_LENGTH) }),
    ...(anchor.id && { link_id: anchor.id }),
    ...(anchor.className && { link_classes: anchor.className }),
  };
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

  const ctx = buildBaseClickContext(anchor);

  switch (url.protocol) {
    case 'mailto:':
      sendFynchEvent(CLICK_EMAIL, url.pathname, ctx);
      return;
    case 'tel:':
    case 'callto:':
      sendFynchEvent(CLICK_PHONE, url.pathname, ctx);
      return;
    case 'sms:':
      sendFynchEvent(CLICK_SMS, url.pathname, ctx);
      return;
  }

  if (isDownloadLink(url.pathname)) {
    const fileInfo = extractFileInfo(url.pathname);
    sendFynchEvent(CLICK_DOWNLOAD, url.pathname, {
      ...ctx,
      ...(fileInfo && { file_name: fileInfo.file_name, file_extension: fileInfo.file_extension }),
    });
    return;
  }

  if (isOutboundLink(href)) {
    sendFynchEvent(CLICK_OUTBOUND, url.href, {
      ...ctx,
      link_domain: url.hostname,
    });
  }
}

document.addEventListener('click', handleClick, { capture: true, passive: true });
