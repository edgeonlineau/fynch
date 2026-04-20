import type { FynchEventAction } from './constants';

window.dataLayer = window.dataLayer || [];

export interface FormMetadata {
  readonly form_platform: string;
  readonly form_name: string;
}

const DEDUP_WINDOW_MS = 500;
let lastEventKey = '';
let lastEventTime = 0;

function isDuplicate(action: FynchEventAction, specifics: string): boolean {
  const key = `${action}::${specifics}`;
  const now = Date.now();
  if (key === lastEventKey && now - lastEventTime < DEDUP_WINDOW_MS) {
    return true;
  }
  lastEventKey = key;
  lastEventTime = now;
  return false;
}

function buildPageContext(): Pick<
  DataLayerEvent,
  'page_url' | 'page_title' | 'page_path' | 'referrer' | 'timestamp'
> {
  return {
    page_url: window.location.href,
    page_title: document.title,
    page_path: window.location.pathname,
    referrer: document.referrer,
    timestamp: new Date().toISOString(),
  };
}

export function sendFynchEvent(
  action: FynchEventAction,
  specifics: string,
  formMetadata?: FormMetadata,
): void {
  if (isDuplicate(action, specifics)) return;

  const event: DataLayerEvent = {
    event: 'fynch.event',
    action,
    specifics,
    ...buildPageContext(),
    ...(formMetadata && {
      form_platform: formMetadata.form_platform,
      form_name: formMetadata.form_name,
    }),
  };

  dataLayer.push(event);
}
