import { handleAnchorClick } from './click-listeners';
import { handleCtaClick } from './cta-listener';

// One capture-phase listener serves both the anchor classifier and the CTA tracker.
document.addEventListener(
  'click',
  (event: MouseEvent) => {
    handleAnchorClick(event);
    handleCtaClick(event);
  },
  { capture: true, passive: true },
);
