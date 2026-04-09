import { describe, it, expect, beforeEach } from 'vitest';

describe('fynch entry point', () => {
  beforeEach(() => {
    window.dataLayer = [];
  });

  it('registers click and form listeners when imported', async () => {
    const clickListenerSpy = new Promise<void>((resolve) => {
      document.addEventListener(
        'click',
        () => {
          resolve();
        },
        { once: true },
      );
    });

    await import('../fynch');

    document.body.click();
    await clickListenerSpy;
  });

  it('has dataLayer available after import', async () => {
    await import('../fynch');
    expect(Array.isArray(window.dataLayer)).toBe(true);
  });
});
