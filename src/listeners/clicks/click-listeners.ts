import { sendFynchEvent } from '../../utilities/send-fynch-event';
import { CLICK_EMAIL_EVENT, CLICK_PHONE_EVENT, CLICK_SMS_EVENT } from '../../utilities/constants';
import { isAnchorElement } from '../../types/type-guards';

function findAnchorFromTarget(target: EventTarget | null): HTMLAnchorElement | null {
  let current = target;
  while (current instanceof HTMLElement) {
    if (isAnchorElement(current)) return current;
    current = current.parentElement;
  }
  return null;
}

function handleClick(event: MouseEvent): void {
  const anchor = findAnchorFromTarget(event.target);
  if (!anchor) return;

  const url = new URL(anchor.href);
  switch (url.protocol) {
    case 'mailto:':
      sendFynchEvent(CLICK_EMAIL_EVENT, url.pathname);
      break;
    case 'tel:':
    case 'callto:':
      sendFynchEvent(CLICK_PHONE_EVENT, url.pathname);
      break;
    case 'sms:':
      sendFynchEvent(CLICK_SMS_EVENT, url.pathname);
      break;
  }
}

document.addEventListener('click', handleClick, { capture: true, passive: true });
