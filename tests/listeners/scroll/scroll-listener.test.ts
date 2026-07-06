import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('scroll-listener', () => {
  beforeEach(() => {
    window.dataLayer = [];
    vi.resetModules();
  });

  function setScrollPosition(scrollY: number, scrollHeight: number, innerHeight: number) {
    Object.defineProperty(window, 'scrollY', {
      value: scrollY,
      writable: true,
      configurable: true,
    });
    Object.defineProperty(document.documentElement, 'scrollHeight', {
      value: scrollHeight,
      writable: true,
      configurable: true,
    });
    Object.defineProperty(window, 'innerHeight', {
      value: innerHeight,
      writable: true,
      configurable: true,
    });
  }

  function nextFrame(): Promise<void> {
    return new Promise((resolve) => requestAnimationFrame(() => resolve()));
  }

  it('fires scroll_milestone at 25%', async () => {
    setScrollPosition(0, 2000, 500);
    await import('../../../src/listeners/scroll/scroll-listener');

    setScrollPosition(375, 2000, 500);
    window.dispatchEvent(new Event('scroll'));
    await nextFrame();

    expect(window.dataLayer).toContainEqual(
      expect.objectContaining({
        event: 'fynch.event',
        action: 'scroll_milestone',
        percent_scrolled: 25,
      }),
    );
  });

  it('fires multiple milestones when scrolled far enough', async () => {
    setScrollPosition(0, 2000, 500);
    await import('../../../src/listeners/scroll/scroll-listener');

    setScrollPosition(1125, 2000, 500);
    window.dispatchEvent(new Event('scroll'));
    await nextFrame();

    const milestones = window.dataLayer
      .filter((e) => e.action === 'scroll_milestone')
      .map((e) => e.percent_scrolled);

    expect(milestones).toContain(25);
    expect(milestones).toContain(50);
    expect(milestones).toContain(75);
  });

  it('does not fire duplicate milestones', async () => {
    setScrollPosition(0, 2000, 500);
    await import('../../../src/listeners/scroll/scroll-listener');

    setScrollPosition(500, 2000, 500);
    window.dispatchEvent(new Event('scroll'));
    window.dispatchEvent(new Event('scroll'));
    await nextFrame();
    window.dispatchEvent(new Event('scroll'));
    await nextFrame();

    const milestones25 = window.dataLayer.filter(
      (e) => e.action === 'scroll_milestone' && e.percent_scrolled === 25,
    );
    expect(milestones25).toHaveLength(1);
  });

  it('does not fire milestones when not scrolled enough', async () => {
    setScrollPosition(0, 2000, 500);
    await import('../../../src/listeners/scroll/scroll-listener');

    setScrollPosition(100, 2000, 500);
    window.dispatchEvent(new Event('scroll'));
    await nextFrame();

    const milestones = window.dataLayer.filter((e) => e.action === 'scroll_milestone');
    expect(milestones).toHaveLength(0);
  });

  it('unbinds the scroll listener once every milestone has fired', async () => {
    const removeSpy = vi.spyOn(window, 'removeEventListener');
    setScrollPosition(0, 2000, 500);
    await import('../../../src/listeners/scroll/scroll-listener');

    setScrollPosition(1500, 2000, 500);
    window.dispatchEvent(new Event('scroll'));
    await nextFrame();

    const milestones = window.dataLayer
      .filter((e) => e.action === 'scroll_milestone')
      .map((e) => e.percent_scrolled);
    expect(new Set(milestones)).toEqual(new Set([25, 50, 75, 90]));
    expect(removeSpy).toHaveBeenCalledWith('scroll', expect.any(Function));

    removeSpy.mockRestore();
  });
});
