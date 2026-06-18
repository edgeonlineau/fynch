import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { isFormDuplicate, __testing } from '../../src/utilities/form-dedup';

const testing = __testing as NonNullable<typeof __testing>;

describe('isFormDuplicate', () => {
  beforeEach(() => {
    testing.reset();
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-01-01T00:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('Tier 1: lead_id lifetime dedup', () => {
    it('suppresses a second fire with the same (provider, lead_id) shortly after', () => {
      const params = { provider: 'hubspot-v3', form_id: 'f1', lead_id: 'abc' };
      expect(isFormDuplicate(params)).toBe(false);
      vi.advanceTimersByTime(10);
      expect(isFormDuplicate(params)).toBe(true);
    });

    it('suppresses a second fire with the same (provider, lead_id) 10 minutes later', () => {
      const params = { provider: 'hubspot-v3', form_id: 'f1', lead_id: 'abc' };
      expect(isFormDuplicate(params)).toBe(false);
      vi.advanceTimersByTime(10 * 60 * 1000);
      expect(isFormDuplicate(params)).toBe(true);
    });

    it('allows different lead_ids under the same provider', () => {
      expect(
        isFormDuplicate({ provider: 'hubspot-v3', form_id: 'f1', lead_id: 'abc' }),
      ).toBe(false);
      expect(
        isFormDuplicate({ provider: 'hubspot-v3', form_id: 'f1', lead_id: 'def' }),
      ).toBe(false);
    });

    it('allows the same lead_id value under different providers', () => {
      expect(isFormDuplicate({ provider: 'hubspot-v3', lead_id: 'shared-id' })).toBe(false);
      expect(isFormDuplicate({ provider: 'typeform', lead_id: 'shared-id' })).toBe(false);
    });

    it('takes precedence over Tier 2 — presence of lead_id skips form-identity check', () => {
      expect(
        isFormDuplicate({ provider: 'hubspot-v3', form_id: 'f1', lead_id: 'abc' }),
      ).toBe(false);
      expect(
        isFormDuplicate({ provider: 'hubspot-v3', form_id: 'f1', lead_id: 'def' }),
      ).toBe(false);
    });
  });

  describe('Tier 2: form-identity windowed dedup', () => {
    it('suppresses repeat fire of same form within the 2s window', () => {
      const params = { provider: 'elementor', form_id: '12', form_name: 'Contact' };
      expect(isFormDuplicate(params)).toBe(false);
      vi.advanceTimersByTime(100);
      expect(isFormDuplicate(params)).toBe(true);
    });

    it('allows repeat fire of same form after the 2s window', () => {
      const params = { provider: 'elementor', form_id: '12', form_name: 'Contact' };
      expect(isFormDuplicate(params)).toBe(false);
      vi.advanceTimersByTime(2500);
      expect(isFormDuplicate(params)).toBe(false);
    });

    it('over-suppresses providers that emit no identity (duda)', () => {
      const params = { provider: 'duda' };
      expect(isFormDuplicate(params)).toBe(false);
      vi.advanceTimersByTime(500);
      expect(isFormDuplicate(params)).toBe(true);
    });

    it('treats empty string and undefined form_name as the same key', () => {
      expect(isFormDuplicate({ provider: 'elementor', form_id: '12', form_name: '' })).toBe(
        false,
      );
      expect(
        isFormDuplicate({ provider: 'elementor', form_id: '12', form_name: undefined }),
      ).toBe(true);
    });

    it('treats empty string and undefined form_id as the same key', () => {
      expect(isFormDuplicate({ provider: 'duda', form_id: '' })).toBe(false);
      expect(isFormDuplicate({ provider: 'duda', form_id: undefined })).toBe(true);
    });

    it('keeps different forms under same provider independent', () => {
      expect(isFormDuplicate({ provider: 'elementor', form_id: '12' })).toBe(false);
      expect(isFormDuplicate({ provider: 'elementor', form_id: '99' })).toBe(false);
    });
  });

  describe('memory bounds', () => {
    it('caps Tier 1 lead-id set at 500 entries with oldest evicted', () => {
      for (let i = 0; i < 600; i++) {
        isFormDuplicate({ provider: 'hubspot-v3', lead_id: `lead-${i}` });
      }
      expect(testing.sizes().leadIds).toBeLessThanOrEqual(500);

      expect(isFormDuplicate({ provider: 'hubspot-v3', lead_id: 'lead-0' })).toBe(false);
      expect(isFormDuplicate({ provider: 'hubspot-v3', lead_id: 'lead-599' })).toBe(true);
    });

    it('caps Tier 2 form-key map at 100 entries', () => {
      for (let i = 0; i < 150; i++) {
        isFormDuplicate({ provider: 'elementor', form_id: `form-${i}` });
      }
      expect(testing.sizes().formKeys).toBeLessThanOrEqual(100);
    });

    it('prunes Tier 2 entries older than 2 * window on each call', () => {
      isFormDuplicate({ provider: 'elementor', form_id: 'old' });
      expect(testing.sizes().formKeys).toBe(1);

      vi.advanceTimersByTime(5000);
      isFormDuplicate({ provider: 'elementor', form_id: 'fresh' });

      expect(testing.sizes().formKeys).toBe(1);
    });
  });
});
