import { sendFynchEvent } from '../../utilities/send-fynch-event';
import { SCROLL_MILESTONE } from '../../utilities/constants';

const MILESTONES = [25, 50, 75, 90] as const;
const reached = new Set<number>();

function getScrollPercentage(): number {
  const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
  if (scrollHeight <= 0) return 100;
  return Math.round((window.scrollY / scrollHeight) * 100);
}

function handleScroll(): void {
  const percent = getScrollPercentage();

  for (const milestone of MILESTONES) {
    if (percent >= milestone && !reached.has(milestone)) {
      reached.add(milestone);
      sendFynchEvent(SCROLL_MILESTONE, { percent_scrolled: milestone });
    }
  }
}

window.addEventListener('scroll', handleScroll, { passive: true });
