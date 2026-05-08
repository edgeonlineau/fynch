import { sendFynchEvent, type EventParams } from '../../utilities/send-fynch-event';
import { CLICK_CTA } from '../../utilities/constants';

const MAX_LINK_TEXT_LENGTH = 100;

function findCtaElement(target: EventTarget | null): HTMLElement | null {
  let current = target;
  while (current instanceof HTMLElement) {
    if (current.hasAttribute('data-fynch-cta')) return current;
    current = current.parentElement;
  }
  return null;
}

function findAnchor(cta: HTMLElement): HTMLAnchorElement | null {
  if (cta instanceof HTMLAnchorElement) return cta;
  return cta.querySelector('a');
}

function buildCtaEventParams(cta: HTMLElement): EventParams {
  const anchor = findAnchor(cta);
  const text = cta.textContent?.trim() ?? '';

  const ctx: EventParams = {
    link_url: anchor?.href ?? '',
    ...(text && { link_text: text.slice(0, MAX_LINK_TEXT_LENGTH) }),
    ...(cta.id && { link_id: cta.id }),
    ...(cta.className && { link_classes: cta.className }),
  };

  if (anchor) {
    try {
      const url = new URL(anchor.href);
      if (url.hostname !== window.location.hostname) {
        return { ...ctx, link_domain: url.hostname };
      }
    } catch {
      // invalid href, skip link_domain
    }
  }

  return ctx;
}

function handleCtaClick(event: MouseEvent): void {
  const cta = findCtaElement(event.target);
  if (!cta) return;

  sendFynchEvent(CLICK_CTA, buildCtaEventParams(cta));
}

document.addEventListener('click', handleCtaClick, { capture: true, passive: true });
