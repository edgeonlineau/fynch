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

  it('tracks outbound link clicks', async () => {
    await import('../../../src/listeners/clicks/click-listeners');

    const link = document.createElement('a');
    link.href = 'https://external-site.com/page';
    document.body.appendChild(link);

    clickElement(link);

    expect(window.dataLayer).toContainEqual(
      expect.objectContaining({
        event: 'fynch.event',
        action: 'outbound_link_clicked',
        specifics: 'https://external-site.com/page',
      }),
    );
  });

  it('does not track internal link clicks as outbound', async () => {
    await import('../../../src/listeners/clicks/click-listeners');

    const link = document.createElement('a');
    link.href = `${window.location.origin}/about`;
    document.body.appendChild(link);

    clickElement(link);

    const outbound = window.dataLayer.filter(
      (e) => e.event === 'fynch.event' && e.action === 'outbound_link_clicked',
    );
    expect(outbound).toHaveLength(0);
  });

  it('tracks file download clicks', async () => {
    await import('../../../src/listeners/clicks/click-listeners');

    const link = document.createElement('a');
    link.href = `${window.location.origin}/docs/report.pdf`;
    document.body.appendChild(link);

    clickElement(link);

    expect(window.dataLayer).toContainEqual(
      expect.objectContaining({
        event: 'fynch.event',
        action: 'file_downloaded',
        specifics: '/docs/report.pdf',
      }),
    );
  });

  it('tracks various download extensions', async () => {
    await import('../../../src/listeners/clicks/click-listeners');

    for (const ext of ['.zip', '.doc', '.xlsx', '.csv']) {
      window.dataLayer = [];
      const link = document.createElement('a');
      link.href = `${window.location.origin}/files/archive${ext}`;
      document.body.appendChild(link);

      clickElement(link);

      expect(window.dataLayer).toContainEqual(
        expect.objectContaining({
          action: 'file_downloaded',
        }),
      );
    }
  });

  it('prioritises download over outbound for external download links', async () => {
    await import('../../../src/listeners/clicks/click-listeners');

    const link = document.createElement('a');
    link.href = 'https://cdn.example.com/assets/file.pdf';
    document.body.appendChild(link);

    clickElement(link);

    const actions = window.dataLayer.filter((e) => e.event === 'fynch.event').map((e) => e.action);
    expect(actions).toContain('file_downloaded');
    expect(actions).not.toContain('outbound_link_clicked');
  });
});
