import { sendFynchEvent, type EventParams } from '../../utilities/send-fynch-event';
import {
  CLICK_EMAIL,
  CLICK_PHONE,
  CLICK_SMS,
  CLICK_MESSAGING,
  CLICK_DIRECTIONS,
} from '../../utilities/constants';
import { classifyLink } from './classify-link';
import { MAX_LINK_TEXT_LENGTH } from '../../utilities/constants';

function findAnchorFromTarget(target: EventTarget | null): HTMLAnchorElement | null {
  let current = target;
  while (current instanceof HTMLElement) {
    if (current instanceof HTMLAnchorElement) return current;
    current = current.parentElement;
  }
  return null;
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

export function handleAnchorClick(event: MouseEvent): void {
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

  // Scheme-based intents, including mobile deep links (whatsapp://, maps://).
  switch (url.protocol) {
    case 'mailto:':
      sendFynchEvent(CLICK_EMAIL, ctx);
      return;
    case 'tel:':
    case 'callto:':
      sendFynchEvent(CLICK_PHONE, ctx);
      return;
    case 'sms:':
      sendFynchEvent(CLICK_SMS, ctx);
      return;
    case 'whatsapp:':
      sendFynchEvent(CLICK_MESSAGING, { ...ctx, provider: 'whatsapp' });
      return;
    case 'maps:':
      sendFynchEvent(CLICK_DIRECTIONS, { ...ctx, provider: 'apple' });
      return;
  }

  const classification = classifyLink(url);
  if (!classification) return;

  sendFynchEvent(classification.action, { ...ctx, ...classification.params });
}
