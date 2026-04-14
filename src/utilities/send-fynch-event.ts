import type { FynchEventAction } from './constants';

window.dataLayer = window.dataLayer || [];

export function sendFynchEvent(action: FynchEventAction, specifics: string): void {
  dataLayer.push({
    event: 'fynch.event',
    action,
    specifics,
  });
}
