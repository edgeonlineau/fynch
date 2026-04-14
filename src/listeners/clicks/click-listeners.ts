import { sendFynchEvent } from '../../utilities/send-fynch-event';
import { CLICK_EMAIL, CLICK_PHONE, CLICK_SMS } from '../../utilities/constants';

function findAnchorFromTarget(target: EventTarget | null): HTMLAnchorElement | null {
  let current = target;
  while (current instanceof HTMLElement) {
    if (current instanceof HTMLAnchorElement) return current;
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
      sendFynchEvent(CLICK_EMAIL, url.pathname);
      break;
    case 'tel:':
    case 'callto:':
      sendFynchEvent(CLICK_PHONE, url.pathname);
      break;
    case 'sms:':
      sendFynchEvent(CLICK_SMS, url.pathname);
      break;
  }
}

document.addEventListener('click', handleClick, { capture: true, passive: true });
