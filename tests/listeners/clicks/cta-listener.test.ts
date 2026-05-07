import { describe, it, expect, beforeEach } from 'vitest';

describe('cta-listener', () => {
  beforeEach(() => {
    window.dataLayer = [];
    document.body.innerHTML = '';
  });

  function clickElement(el: HTMLElement) {
    el.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
  }

  it('tracks clicks on elements with data-fynch-cta attribute', async () => {
    await import('../../../src/listeners/clicks/cta-listener');

    const button = document.createElement('button');
    button.setAttribute('data-fynch-cta', 'Get Started');
    button.id = 'hero-cta';
    button.className = 'btn primary';
    document.body.appendChild(button);

    clickElement(button);

    expect(window.dataLayer).toContainEqual(
      expect.objectContaining({
        event: 'fynch.event',
        action: 'cta_clicked',
        specifics: 'Get Started',
        link_id: 'hero-cta',
        link_classes: 'btn primary',
      }),
    );
  });

  it('falls back to text content when data-fynch-cta is empty', async () => {
    await import('../../../src/listeners/clicks/cta-listener');

    const button = document.createElement('button');
    button.setAttribute('data-fynch-cta', '');
    button.textContent = 'Sign Up Now';
    document.body.appendChild(button);

    clickElement(button);

    expect(window.dataLayer).toContainEqual(
      expect.objectContaining({
        event: 'fynch.event',
        action: 'cta_clicked',
        specifics: 'Sign Up Now',
      }),
    );
  });

  it('tracks clicks on nested elements within a CTA', async () => {
    await import('../../../src/listeners/clicks/cta-listener');

    const div = document.createElement('div');
    div.setAttribute('data-fynch-cta', 'Hero CTA');
    const span = document.createElement('span');
    span.textContent = 'Click me';
    div.appendChild(span);
    document.body.appendChild(div);

    clickElement(span);

    expect(window.dataLayer).toContainEqual(
      expect.objectContaining({
        event: 'fynch.event',
        action: 'cta_clicked',
        specifics: 'Hero CTA',
      }),
    );
  });

  it('includes link_url when CTA is an anchor', async () => {
    await import('../../../src/listeners/clicks/cta-listener');

    const link = document.createElement('a');
    link.setAttribute('data-fynch-cta', 'Learn More');
    link.href = `${window.location.origin}/pricing`;
    document.body.appendChild(link);

    clickElement(link);

    expect(window.dataLayer).toContainEqual(
      expect.objectContaining({
        action: 'cta_clicked',
        link_url: `${window.location.origin}/pricing`,
      }),
    );
  });

  it('includes link_domain when CTA links to external site', async () => {
    await import('../../../src/listeners/clicks/cta-listener');

    const link = document.createElement('a');
    link.setAttribute('data-fynch-cta', 'Partner Site');
    link.href = 'https://partner.example.com/signup';
    document.body.appendChild(link);

    clickElement(link);

    expect(window.dataLayer).toContainEqual(
      expect.objectContaining({
        action: 'cta_clicked',
        link_url: 'https://partner.example.com/signup',
        link_domain: 'partner.example.com',
      }),
    );
  });

  it('includes link_url from nested anchor inside CTA', async () => {
    await import('../../../src/listeners/clicks/cta-listener');

    const div = document.createElement('div');
    div.setAttribute('data-fynch-cta', 'Card CTA');
    const link = document.createElement('a');
    link.href = 'https://external.com/page';
    link.textContent = 'Go';
    div.appendChild(link);
    document.body.appendChild(div);

    clickElement(div);

    expect(window.dataLayer).toContainEqual(
      expect.objectContaining({
        action: 'cta_clicked',
        link_url: 'https://external.com/page',
        link_domain: 'external.com',
      }),
    );
  });

  it('does not track clicks on elements without data-fynch-cta', async () => {
    await import('../../../src/listeners/clicks/cta-listener');

    const button = document.createElement('button');
    button.textContent = 'Regular button';
    document.body.appendChild(button);

    clickElement(button);

    const ctaEvents = window.dataLayer.filter(
      (e) => e.event === 'fynch.event' && e.action === 'cta_clicked',
    );
    expect(ctaEvents).toHaveLength(0);
  });
});
