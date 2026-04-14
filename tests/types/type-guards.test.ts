import { describe, expect, test } from 'vitest';
import {
  isAnchorElement,
  isCustomEvent,
  isFluentFormsData,
  isNinjaFormsResponse,
} from '../../src/types/type-guards';

describe('isAnchorElement', () => {
  test('returns true for anchor elements', () => {
    const anchor = document.createElement('a');
    expect(isAnchorElement(anchor)).toBe(true);
  });

  test('returns false for other elements', () => {
    const div = document.createElement('div');
    expect(isAnchorElement(div)).toBe(false);
  });

  test('returns false for null', () => {
    expect(isAnchorElement(null)).toBe(false);
  });
});

describe('isCustomEvent', () => {
  test('returns true for CustomEvent', () => {
    const event = new CustomEvent('test', { detail: { id: '123' } });
    expect(isCustomEvent(event)).toBe(true);
  });

  test('returns false for regular Event', () => {
    const event = new Event('test');
    expect(isCustomEvent(event)).toBe(false);
  });
});

describe('isFluentFormsData', () => {
  test('returns true for object with config property', () => {
    expect(isFluentFormsData({ config: { id: '42' } })).toBe(true);
  });

  test('returns true for object with undefined config', () => {
    expect(isFluentFormsData({ config: undefined })).toBe(true);
  });

  test('returns false for null', () => {
    expect(isFluentFormsData(null)).toBe(false);
  });

  test('returns false for object without config', () => {
    expect(isFluentFormsData({ id: '42' })).toBe(false);
  });

  test('returns false for non-object', () => {
    expect(isFluentFormsData('string')).toBe(false);
  });
});

describe('isNinjaFormsResponse', () => {
  test('returns true for object with id property', () => {
    expect(isNinjaFormsResponse({ id: '42' })).toBe(true);
  });

  test('returns true for object with undefined id', () => {
    expect(isNinjaFormsResponse({ id: undefined })).toBe(true);
  });

  test('returns false for null', () => {
    expect(isNinjaFormsResponse(null)).toBe(false);
  });

  test('returns false for object without id', () => {
    expect(isNinjaFormsResponse({ name: 'test' })).toBe(false);
  });

  test('returns false for non-object', () => {
    expect(isNinjaFormsResponse(42)).toBe(false);
  });
});
