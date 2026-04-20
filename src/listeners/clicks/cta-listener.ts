import { sendFynchEvent } from '../../utilities/send-fynch-event';
import { CLICK_CTA } from '../../utilities/constants';

function findCtaElement(target: EventTarget | null): HTMLElement | null {
  let current = target;
  while (current instanceof HTMLElement) {
    if (current.hasAttribute('data-fynch-cta')) return current;
    current = current.parentElement;
  }
  return null;
}

function handleCtaClick(event: MouseEvent): void {
  const cta = findCtaElement(event.target);
  if (!cta) return;

  const label = cta.getAttribute('data-fynch-cta') || cta.textContent?.trim().slice(0, 100) || '';
  sendFynchEvent(CLICK_CTA, label);
}

document.addEventListener('click', handleCtaClick, { capture: true, passive: true });
