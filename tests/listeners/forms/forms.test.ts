import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('form-listeners', () => {
  beforeEach(() => {
    window.dataLayer = [];
    vi.resetModules();
  });

  it('tracks Contact Form 7 submissions with form metadata', async () => {
    await import('../../../src/listeners/forms/index');

    const event = new CustomEvent('wpcf7mailsent', {
      detail: { contactFormId: '123' },
    });
    document.dispatchEvent(event);

    expect(window.dataLayer).toContainEqual(
      expect.objectContaining({
        event: 'fynch.event',
        action: 'form_lead',
        specifics: 'Contact Form 7 ID: 123',
        platform: 'contact-form-7',
        form_name: '123',
      }),
    );
  });

  it('tracks HubSpot Forms v3 submissions via postMessage', async () => {
    await import('../../../src/listeners/forms/index');

    const event = new MessageEvent('message', {
      data: {
        type: 'hsFormCallback',
        eventName: 'onFormSubmitted',
        id: 'hs-form-456',
      },
    });
    window.dispatchEvent(event);

    expect(window.dataLayer).toContainEqual(
      expect.objectContaining({
        event: 'fynch.event',
        action: 'form_lead',
        specifics: 'HubSpot Form ID: hs-form-456',
        platform: 'hubspot-v3',
        form_name: 'hs-form-456',
      }),
    );
  });

  it('ignores non-HubSpot postMessage events', async () => {
    await import('../../../src/listeners/forms/index');

    const event = new MessageEvent('message', {
      data: { type: 'otherCallback', eventName: 'something' },
    });
    window.dispatchEvent(event);

    const formLeads = window.dataLayer.filter(
      (e) => e.event === 'fynch.event' && e.action === 'form_lead',
    );
    expect(formLeads).toHaveLength(0);
  });

  it('tracks HubSpot Forms v4 submissions', async () => {
    const mockGetFormId = vi.fn().mockReturnValue('hs-v4-789');
    const mockGetFormFromEvent = vi.fn().mockReturnValue({ getFormId: mockGetFormId });

    (window as unknown as Record<string, unknown>).HubspotFormsV4 = {
      getFormFromEvent: mockGetFormFromEvent,
    };

    await import('../../../src/listeners/forms/index');

    const event = new Event('hs-form-event:on-submission:success');
    window.dispatchEvent(event);

    expect(window.dataLayer).toContainEqual(
      expect.objectContaining({
        event: 'fynch.event',
        action: 'form_lead',
        specifics: 'HubSpot Form ID: hs-v4-789',
        platform: 'hubspot-v4',
        form_name: 'hs-v4-789',
      }),
    );
  });

  it('does not track HubSpot v4 when form is null', async () => {
    const mockGetFormFromEvent = vi.fn().mockReturnValue(null);

    (window as unknown as Record<string, unknown>).HubspotFormsV4 = {
      getFormFromEvent: mockGetFormFromEvent,
    };

    await import('../../../src/listeners/forms/index');

    const event = new Event('hs-form-event:on-submission:success');
    window.dispatchEvent(event);

    const formLeads = window.dataLayer.filter(
      (e) => e.event === 'fynch.event' && e.action === 'form_lead',
    );
    expect(formLeads).toHaveLength(0);
  });

  it('tracks Duda form submissions when dmAPI is available', async () => {
    let capturedCallback: (() => void) | undefined;

    (window as unknown as Record<string, unknown>).dmAPI = {
      EVENTS: { FORM_SUBMISSION: 'FORM_SUBMISSION' },
      subscribeEvent: (_event: string, callback: () => void) => {
        capturedCallback = callback;
      },
    };

    await import('../../../src/listeners/forms/index');

    capturedCallback?.();

    expect(window.dataLayer).toContainEqual(
      expect.objectContaining({
        event: 'fynch.event',
        action: 'form_lead',
        specifics: 'Duda Form',
        platform: 'duda',
        form_name: 'Duda Form',
      }),
    );
  });

  it('tracks Typeform submissions via postMessage', async () => {
    await import('../../../src/listeners/forms/index');

    const event = new MessageEvent('message', {
      data: {
        type: 'form-submit',
        formId: 'tf-abc123',
      },
    });
    window.dispatchEvent(event);

    expect(window.dataLayer).toContainEqual(
      expect.objectContaining({
        event: 'fynch.event',
        action: 'form_lead',
        specifics: 'Typeform ID: tf-abc123',
        platform: 'typeform',
        form_name: 'tf-abc123',
      }),
    );
  });

  it('tracks generic form submissions', async () => {
    await import('../../../src/listeners/forms/index');

    const form = document.createElement('form');
    form.setAttribute('name', 'contact-us');
    document.body.appendChild(form);

    form.dispatchEvent(new SubmitEvent('submit', { bubbles: true, cancelable: true }));

    expect(window.dataLayer).toContainEqual(
      expect.objectContaining({
        event: 'fynch.event',
        action: 'form_lead',
        specifics: 'Generic Form: contact-us',
        platform: 'generic',
        form_name: 'contact-us',
      }),
    );
  });

  it('does not track known form platforms as generic', async () => {
    await import('../../../src/listeners/forms/index');

    const form = document.createElement('form');
    form.classList.add('wpcf7-form');
    document.body.appendChild(form);

    form.dispatchEvent(new SubmitEvent('submit', { bubbles: true, cancelable: true }));

    const genericEvents = window.dataLayer.filter((e) => e.platform === 'generic');
    expect(genericEvents).toHaveLength(0);
  });
});
