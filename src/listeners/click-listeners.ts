import sendFynchEvent from "../send-fynch-event";
import {CLICK_EMAIL_EVENT, CLICK_PHONE_EVENT, CLICK_SMS_EVENT} from "../constants";

document.addEventListener('click', function (event: MouseEvent) {
  let link: string | null = null;
  const target = event.target as HTMLElement;

  if (target.tagName === 'A') {
    link = (target as HTMLAnchorElement).href;
  } else {
    let currentElement: HTMLElement = target;
    while(currentElement.parentNode) {
      currentElement = currentElement.parentNode as HTMLElement;

      if (currentElement.tagName === 'A') {
        link = (currentElement as HTMLAnchorElement).href;
        break;
      }
    }
  }

  if (link) {
    const url = new URL(link);
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
}, { capture: true, passive: true });
