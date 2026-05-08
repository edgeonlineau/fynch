import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('form-listeners', () => {
  beforeEach(() => {
    window.dataLayer = [];
    vi.resetModules();
  });

  it('tracks Contact Form 7 submissions with form metadata', async () => {
    const wrapper = document.createElement('div');
    wrapper.id = 'wpcf7-f123-p456-o1';
    wrapper.setAttribute('data-name', 'Contact Us');
    document.body.appendChild(wrapper);

    await import('../../../src/listeners/forms/index');

    const event = new CustomEvent('wpcf7mailsent', {
      detail: { contactFormId: '123' },
    });
    document.dispatchEvent(event);

    expect(window.dataLayer).toContainEqual(
      expect.objectContaining({
        event: 'fynch.event',
        action: 'form_lead',
        service_provider: 'contact-form-7',
        form_id: '123',
        form_name: 'Contact Us',
      }),
    );

    wrapper.remove();
  });

  it('tracks HubSpot Forms v3 submissions via postMessage', async () => {
    await import('../../../src/listeners/forms/index');

    const event = new MessageEvent('message', {
      data: {
        type: 'hsFormCallback',
        eventName: 'onFormSubmitted',
        id: 'hs-form-456',
        data: { submissionGuid: 'guid-789' },
      },
    });
    window.dispatchEvent(event);

    expect(window.dataLayer).toContainEqual(
      expect.objectContaining({
        event: 'fynch.event',
        action: 'form_lead',
        service_provider: 'hubspot-v3',
        form_id: 'hs-form-456',
        lead_id: 'guid-789',
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

    const event = new CustomEvent('hs-form-event:on-submission:success', {
      detail: { submissionGuid: 'v4-guid-001' },
    });
    window.dispatchEvent(event);

    expect(window.dataLayer).toContainEqual(
      expect.objectContaining({
        event: 'fynch.event',
        action: 'form_lead',
        service_provider: 'hubspot-v4',
        form_id: 'hs-v4-789',
        lead_id: 'v4-guid-001',
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
        service_provider: 'duda',
      }),
    );
  });

  it('tracks Typeform submissions via postMessage', async () => {
    await import('../../../src/listeners/forms/index');

    const event = new MessageEvent('message', {
      data: {
        type: 'form-submit',
        formId: 'tf-abc123',
        responseId: 'resp-xyz',
      },
    });
    window.dispatchEvent(event);

    expect(window.dataLayer).toContainEqual(
      expect.objectContaining({
        event: 'fynch.event',
        action: 'form_lead',
        service_provider: 'typeform',
        form_id: 'tf-abc123',
        lead_id: 'resp-xyz',
      }),
    );
  });
});
