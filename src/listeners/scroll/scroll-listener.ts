import { sendFynchEvent } from '../../utilities/send-fynch-event';
import { SCROLL_MILESTONE } from '../../utilities/constants';

const MILESTONES = [25, 50, 75, 90] as const;
const reached = new Set<number>();
let frameRequested = false;

function getScrollPercentage(): number {
  const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
  if (scrollHeight <= 0) return 100;
  return Math.round((window.scrollY / scrollHeight) * 100);
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

window.addEventListener('scroll', handleScroll, { passive: true });
