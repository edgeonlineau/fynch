import { describe, it, expect, beforeEach } from 'vitest';

describe('click-listeners', () => {
  beforeEach(() => {
    window.dataLayer = [];
    document.body.innerHTML = '';
  });

  function clickElement(el: HTMLElement) {
    el.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
  }

  it('tracks mailto link clicks as click_to_email', async () => {
    await import('../../../src/listeners/clicks');

    const link = document.createElement('a');
    link.href = 'mailto:hello@example.com';
    link.textContent = 'Email Us';
    document.body.appendChild(link);

    clickElement(link);

    expect(window.dataLayer).toContainEqual(
      expect.objectContaining({
        event: 'fynch.event',
        action: 'click_to_email',
        link_url: 'mailto:hello@example.com',
        link_text: 'Email Us',
      }),
    );
  });

  it('tracks tel link clicks as click_to_call', async () => {
    await import('../../../src/listeners/clicks');

    const link = document.createElement('a');
    link.href = 'tel:+1234567890';
    document.body.appendChild(link);

    clickElement(link);

    expect(window.dataLayer).toContainEqual(
      expect.objectContaining({
        event: 'fynch.event',
        action: 'click_to_call',
      }),
    );
  });

  it('tracks sms link clicks as click_to_text', async () => {
    await import('../../../src/listeners/clicks');

    const link = document.createElement('a');
    link.href = 'sms:+1234567890';
    document.body.appendChild(link);

    clickElement(link);

    expect(window.dataLayer).toContainEqual(
      expect.objectContaining({
        event: 'fynch.event',
        action: 'click_to_text',
      }),
    );
  });

  it('tracks clicks on nested elements within anchor tags', async () => {
    await import('../../../src/listeners/clicks');

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
        action: 'click_to_email',
      }),
    );
  });

  it('does not track clicks on non-anchor elements', async () => {
    await import('../../../src/listeners/clicks');

    const div = document.createElement('div');
    div.textContent = 'Not a link';
    document.body.appendChild(div);

    clickElement(div);

    const fynchEvents = window.dataLayer.filter((e) => e.event === 'fynch.event');
    expect(fynchEvents).toHaveLength(0);
  });

  it('tracks callto protocol as click_to_call', async () => {
    await import('../../../src/listeners/clicks');

    const link = document.createElement('a');
    link.href = 'callto:+1234567890';
    document.body.appendChild(link);

    clickElement(link);

    expect(window.dataLayer).toContainEqual(
      expect.objectContaining({
        event: 'fynch.event',
        action: 'click_to_call',
      }),
    );
  });

  it('tracks outbound link clicks with link_domain', async () => {
    await import('../../../src/listeners/clicks');

    const link = document.createElement('a');
    link.href = 'https://external-site.com/page';
    link.textContent = 'Visit Partner';
    document.body.appendChild(link);

    clickElement(link);

    expect(window.dataLayer).toContainEqual(
      expect.objectContaining({
        event: 'fynch.event',
        action: 'outbound_click',
        link_url: 'https://external-site.com/page',
        link_text: 'Visit Partner',
        link_domain: 'external-site.com',
      }),
    );
  });

  it('does not track internal link clicks as outbound', async () => {
    await import('../../../src/listeners/clicks');

    const link = document.createElement('a');
    link.href = `${window.location.origin}/about`;
    document.body.appendChild(link);

    clickElement(link);

    const outbound = window.dataLayer.filter(
      (e) => e.event === 'fynch.event' && e.action === 'outbound_click',
    );
    expect(outbound).toHaveLength(0);
  });

  it('tracks file download clicks with file_name and file_extension', async () => {
    await import('../../../src/listeners/clicks');

    const link = document.createElement('a');
    link.href = `${window.location.origin}/docs/report.pdf`;
    link.textContent = 'Download Report';
    document.body.appendChild(link);

    clickElement(link);

    expect(window.dataLayer).toContainEqual(
      expect.objectContaining({
        event: 'fynch.event',
        action: 'download_file_click',
        link_url: `${window.location.origin}/docs/report.pdf`,
        link_text: 'Download Report',
        file_name: 'report.pdf',
        file_extension: 'pdf',
      }),
    );
  });

  it('tracks various download extensions', async () => {
    await import('../../../src/listeners/clicks');

    for (const ext of ['.zip', '.doc', '.xlsx', '.csv']) {
      window.dataLayer = [];
      const link = document.createElement('a');
      link.href = `${window.location.origin}/files/archive${ext}`;
      document.body.appendChild(link);

      clickElement(link);

      expect(window.dataLayer).toContainEqual(
        expect.objectContaining({
          action: 'download_file_click',
        }),
      );
    }
  });

  it('includes link_id and link_classes when present', async () => {
    await import('../../../src/listeners/clicks');

    const link = document.createElement('a');
    link.href = 'mailto:test@example.com';
    link.id = 'contact-link';
    link.className = 'btn btn-primary';
    link.textContent = 'Contact';
    document.body.appendChild(link);

    clickElement(link);

    expect(window.dataLayer).toContainEqual(
      expect.objectContaining({
        action: 'click_to_email',
        link_id: 'contact-link',
        link_classes: 'btn btn-primary',
      }),
    );
  });

  it('omits link_id and link_classes when absent', async () => {
    await import('../../../src/listeners/clicks');

    const link = document.createElement('a');
    link.href = 'mailto:test@example.com';
    document.body.appendChild(link);

    clickElement(link);

    const event = window.dataLayer.find((e) => e.action === 'click_to_email');
    expect(event?.link_id).toBeUndefined();
    expect(event?.link_classes).toBeUndefined();
  });

  it('truncates link_text to 100 characters', async () => {
    await import('../../../src/listeners/clicks');

    const link = document.createElement('a');
    link.href = 'mailto:longtext@example.com';
    link.textContent = 'A'.repeat(150);
    document.body.appendChild(link);

    clickElement(link);

    const event = window.dataLayer.find((e) => e.link_url === 'mailto:longtext@example.com');
    expect(event?.link_text).toHaveLength(100);
  });

  it('prioritises download over outbound for external download links', async () => {
    await import('../../../src/listeners/clicks');

    const link = document.createElement('a');
    link.href = 'https://cdn.example.com/assets/file.pdf';
    document.body.appendChild(link);

    clickElement(link);

    const actions = window.dataLayer.filter((e) => e.event === 'fynch.event').map((e) => e.action);
    expect(actions).toContain('download_file_click');
    expect(actions).not.toContain('outbound_click');
  });

  it('tracks maps links as get_directions with provider', async () => {
    await import('../../../src/listeners/clicks');

    const link = document.createElement('a');
    link.href = 'https://www.google.com/maps/place/Cafe';
    link.textContent = 'Get Directions';
    document.body.appendChild(link);

    clickElement(link);

    expect(window.dataLayer).toContainEqual(
      expect.objectContaining({
        event: 'fynch.event',
        action: 'get_directions',
        link_url: 'https://www.google.com/maps/place/Cafe',
        link_text: 'Get Directions',
        provider: 'google',
      }),
    );
  });

  it('tracks WhatsApp links as click_to_message', async () => {
    await import('../../../src/listeners/clicks');

    const link = document.createElement('a');
    link.href = 'https://wa.me/15551234567';
    document.body.appendChild(link);

    clickElement(link);

    expect(window.dataLayer).toContainEqual(
      expect.objectContaining({
        event: 'fynch.event',
        action: 'click_to_message',
        provider: 'whatsapp',
      }),
    );
  });

  it('tracks app store links as app_store_click', async () => {
    await import('../../../src/listeners/clicks');

    const link = document.createElement('a');
    link.href = 'https://apps.apple.com/us/app/x/id123';
    document.body.appendChild(link);

    clickElement(link);

    expect(window.dataLayer).toContainEqual(
      expect.objectContaining({
        event: 'fynch.event',
        action: 'app_store_click',
        provider: 'apple',
      }),
    );
  });

  it('tracks .ics links as add_to_calendar', async () => {
    await import('../../../src/listeners/clicks');

    const link = document.createElement('a');
    link.href = `${window.location.origin}/events/invite.ics`;
    document.body.appendChild(link);

    clickElement(link);

    expect(window.dataLayer).toContainEqual(
      expect.objectContaining({
        event: 'fynch.event',
        action: 'add_to_calendar',
        provider: 'ics',
      }),
    );
  });

  it('tracks whatsapp:// deep links as click_to_message', async () => {
    await import('../../../src/listeners/clicks');

    const link = document.createElement('a');
    link.href = 'whatsapp://send?phone=15551234567';
    document.body.appendChild(link);

    clickElement(link);

    expect(window.dataLayer).toContainEqual(
      expect.objectContaining({
        event: 'fynch.event',
        action: 'click_to_message',
        provider: 'whatsapp',
      }),
    );
  });

  it('tracks maps:// deep links as get_directions', async () => {
    await import('../../../src/listeners/clicks');

    const link = document.createElement('a');
    link.href = 'maps://?q=cafe';
    document.body.appendChild(link);

    clickElement(link);

    expect(window.dataLayer).toContainEqual(
      expect.objectContaining({
        event: 'fynch.event',
        action: 'get_directions',
        provider: 'apple',
      }),
    );
  });
});
