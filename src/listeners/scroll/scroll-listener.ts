import { sendFynchEvent } from '../../utilities/send-fynch-event';
import { SCROLL_MILESTONE } from '../../utilities/constants';

const MILESTONES = [25, 50, 75, 90] as const;
const reached = new Set<number>();
let frameRequested = false;

function getScrollableHeight(): number {
  return document.documentElement.scrollHeight - window.innerHeight;
}

function getScrollPercentage(): number {
  const scrollable = getScrollableHeight();
  if (scrollable <= 0) return 100;
  return Math.round((window.scrollY / scrollable) * 100);
}

function checkMilestones(): void {
  const percent = getScrollPercentage();

  for (const milestone of MILESTONES) {
    if (percent >= milestone && !reached.has(milestone)) {
      reached.add(milestone);
      sendFynchEvent(SCROLL_MILESTONE, { percent_scrolled: milestone });
    }
  }

  if (reached.size === MILESTONES.length) {
    window.removeEventListener('scroll', handleScroll);
  }
}

// Coalesce scroll events to one layout read per frame; scrollHeight/scrollY
// are layout-bound properties and scroll can fire many times per frame.
function handleScroll(): void {
  if (frameRequested) return;
  frameRequested = true;
  requestAnimationFrame(() => {
    frameRequested = false;
    checkMilestones();
  });
}

// If the user is already past a milestone by the time Fynch loads — a deferred
// or late-injected script, a reload that restores scroll position, or a deep
// link into a long page — no scroll event fires for those depths, so evaluate
// the current position once. Skip non-scrollable pages: no scroll engagement is
// possible there, and firing depth milestones would be misleading (GA4 likewise
// never fires scroll on a page that fits the viewport).
function checkInitialPosition(): void {
  if (getScrollableHeight() <= 0) return;
  checkMilestones();
}

window.addEventListener('scroll', handleScroll, { passive: true });

// Defer the initial read to `load` so it runs against the final, image-settled
// page height; if Fynch is injected after load has already fired, read now.
if (document.readyState === 'complete') {
  checkInitialPosition();
} else {
  window.addEventListener('load', checkInitialPosition, { once: true });
}
