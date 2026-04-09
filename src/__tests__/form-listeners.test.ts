import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('form-listeners', () => {
  beforeEach(() => {
    window.dataLayer = [];
    vi.resetModules();
  });

  it('tracks Contact Form 7 submissions', async () => {
    await import('../listeners/form-listeners');

    const event = new CustomEvent('wpcf7mailsent', {
      detail: { contactFormId: '123' },
    });
    document.dispatchEvent(event);

    expect(window.dataLayer).toContainEqual(
      expect.objectContaining({
        event: 'fynch.event',
        action: 'form_lead',
        specifics: 'Contact Form 7 ID: 123',
      }),
    );
  });

  it('tracks HubSpot Forms v3 submissions via postMessage', async () => {
    await import('../listeners/form-listeners');

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
      }),
    );
  });

  it('ignores non-HubSpot postMessage events', async () => {
    await import('../listeners/form-listeners');

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

    await import('../listeners/form-listeners');

    const event = new Event('hs-form-event:on-submission:success');
    window.dispatchEvent(event);

    expect(window.dataLayer).toContainEqual(
      expect.objectContaining({
        event: 'fynch.event',
        action: 'form_lead',
        specifics: 'HubSpot Form ID: hs-v4-789',
      }),
    );
  });

  it('does not track HubSpot v4 when form is null', async () => {
    const mockGetFormFromEvent = vi.fn().mockReturnValue(null);

    (window as unknown as Record<string, unknown>).HubspotFormsV4 = {
      getFormFromEvent: mockGetFormFromEvent,
    };

    await import('../listeners/form-listeners');

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

    await import('../listeners/form-listeners');

    capturedCallback?.();

    expect(window.dataLayer).toContainEqual(
      expect.objectContaining({
        event: 'fynch.event',
        action: 'form_lead',
        specifics: 'Duda Form',
      }),
    );
  });
});
