import { describe, it, expect, beforeEach } from 'vitest';

describe('click-listeners', () => {
  beforeEach(() => {
    window.dataLayer = [];
    document.body.innerHTML = '';
  });

  function clickElement(el: HTMLElement) {
    el.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
  }

  it('tracks mailto link clicks as email_clicked', async () => {
    await import('../../../src/listeners/clicks/click-listeners');

    const link = document.createElement('a');
    link.href = 'mailto:hello@example.com';
    document.body.appendChild(link);

    clickElement(link);

    expect(window.dataLayer).toContainEqual(
      expect.objectContaining({
        event: 'fynch.event',
        action: 'email_clicked',
      }),
    );
  });

  it('tracks tel link clicks as phone_clicked', async () => {
    await import('../../../src/listeners/clicks/click-listeners');

    const link = document.createElement('a');
    link.href = 'tel:+1234567890';
    document.body.appendChild(link);

    clickElement(link);

    expect(window.dataLayer).toContainEqual(
      expect.objectContaining({
        event: 'fynch.event',
        action: 'phone_clicked',
      }),
    );
  });

  it('tracks sms link clicks as sms_clicked', async () => {
    await import('../../../src/listeners/clicks/click-listeners');

    const link = document.createElement('a');
    link.href = 'sms:+1234567890';
    document.body.appendChild(link);

    clickElement(link);

    expect(window.dataLayer).toContainEqual(
      expect.objectContaining({
        event: 'fynch.event',
        action: 'sms_clicked',
      }),
    );
  });

  it('tracks clicks on nested elements within anchor tags', async () => {
    await import('../../../src/listeners/clicks/click-listeners');

    const link = document.createElement('a');
    link.href = 'mailto:nested@example.com';
    const span = document.createElement('span');
    span.textContent = 'Email us';
    link.appendChild(span);
    document.body.appendChild(link);

    clickElement(span);

    expect(window.dataLayer).toContainEqual(
      expect.objectContaining({
        event: 'fynch.event',
        action: 'email_clicked',
      }),
    );
  });

  it('does not track clicks on regular http links', async () => {
    await import('../../../src/listeners/clicks/click-listeners');

    const link = document.createElement('a');
    link.href = 'https://example.com';
    document.body.appendChild(link);

    clickElement(link);

    const fynchEvents = window.dataLayer.filter((e) => e.event === 'fynch.event');
    expect(fynchEvents).toHaveLength(0);
  });

  it('does not track clicks on non-anchor elements', async () => {
    await import('../../../src/listeners/clicks/click-listeners');

    const div = document.createElement('div');
    div.textContent = 'Not a link';
    document.body.appendChild(div);

    clickElement(div);

    const fynchEvents = window.dataLayer.filter((e) => e.event === 'fynch.event');
    expect(fynchEvents).toHaveLength(0);
  });

  it('tracks callto protocol as phone_clicked', async () => {
    await import('../../../src/listeners/clicks/click-listeners');

    const link = document.createElement('a');
    link.href = 'callto:+1234567890';
    document.body.appendChild(link);

    clickElement(link);

    expect(window.dataLayer).toContainEqual(
      expect.objectContaining({
        event: 'fynch.event',
        action: 'phone_clicked',
      }),
    );
  });
});
