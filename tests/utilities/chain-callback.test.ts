import { describe, it, expect, vi } from 'vitest';
import { chainCallback } from '../../src/utilities/chain-callback';

describe('chainCallback', () => {
  it('invokes the existing callback before ours, with the same arguments', () => {
    const order: string[] = [];
    const existing = vi.fn(() => {
      order.push('existing');
    });
    const next = vi.fn(() => {
      order.push('next');
    });

    const chained = chainCallback<[string, number]>(existing, next);
    chained('lead-1', 42);

    expect(existing).toHaveBeenCalledWith('lead-1', 42);
    expect(next).toHaveBeenCalledWith('lead-1', 42);
    expect(order).toEqual(['existing', 'next']);
  });

  it('works when no existing callback was installed', () => {
    const next = vi.fn();

    const chained = chainCallback(undefined, next);
    chained();

    expect(next).toHaveBeenCalledTimes(1);
  });

  it('ignores a non-function existing value from an untrusted global', () => {
    const next = vi.fn();

    const chained = chainCallback('not-a-function' as unknown as () => void, next);
    expect(() => chained()).not.toThrow();
    expect(next).toHaveBeenCalledTimes(1);
  });
});
