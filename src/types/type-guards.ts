import type { FluentFormsData, NinjaFormsResponse } from './types';

export function isAnchorElement(node: EventTarget | null): node is HTMLAnchorElement {
  return node instanceof HTMLAnchorElement;
}

export function isCustomEvent(event: Event): event is CustomEvent {
  return event instanceof CustomEvent;
}

export function isFluentFormsData(value: unknown): value is FluentFormsData {
  return typeof value === 'object' && value !== null && 'config' in value;
}

export function isNinjaFormsResponse(value: unknown): value is NinjaFormsResponse {
  return typeof value === 'object' && value !== null && 'id' in value;
}
