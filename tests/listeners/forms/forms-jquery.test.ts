import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

type JQueryHandler = (...args: unknown[]) => void;

function createJQueryMock() {
  const handlers: Record<string, JQueryHandler[]> = {};

  const jQueryInstance = {
    on(event: string, handler: JQueryHandler) {
      if (!handlers[event]) {
        handlers[event] = [];
      }
      handlers[event].push(handler);
      return jQueryInstance;
    },
    find(selector: string) {
      return {
        text: () => (selector === '.frm_screen_reader' ? 'Test Form' : ''),
        length: selector === '.et_pb_contact_error_text' ? 0 : 1,
      };
    },
    text: () => '',
    length: 0,
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const jQueryFn = (_selector: unknown) => jQueryInstance;
  jQueryFn._handlers = handlers;
  jQueryFn._instance = jQueryInstance;

  return jQueryFn;
}

function triggerJQueryEvent(
  handlers: Record<string, JQueryHandler[]>,
  event: string,
  ...args: unknown[]
) {
  const eventHandlers = handlers[event] ?? [];
  for (const handler of eventHandlers) {
    handler(...args);
  }
}

describe('form-listeners (jQuery-dependent)', () => {
  let jQueryMock: ReturnType<typeof createJQueryMock>;

  beforeEach(() => {
    window.dataLayer = [];
    vi.resetModules();
    jQueryMock = createJQueryMock();
    (globalThis as unknown as Record<string, unknown>).jQuery = jQueryMock;
  });

  afterEach(() => {
    delete (globalThis as unknown as Record<string, unknown>).jQuery;
  });

  it('tracks Elementor form submissions', async () => {
    await import('../../../src/listeners/forms/index');

    const mockEvent = { target: { name: 'contact-form' } };
    triggerJQueryEvent(jQueryMock._handlers, 'submit_success', mockEvent);

    expect(window.dataLayer).toContainEqual(
      expect.objectContaining({
        event: 'fynch.event',
        action: 'form_lead',
        specifics: 'Elementor Form: contact-form',
      }),
    );
  });

  it('tracks FluentForms submissions when originalEvent is undefined', async () => {
    await import('../../../src/listeners/forms/index');

    const mockEvent = {};
    const mockData = { config: { id: 'ff-42' } };
    triggerJQueryEvent(jQueryMock._handlers, 'fluentform_submission_success', mockEvent, mockData);

    expect(window.dataLayer).toContainEqual(
      expect.objectContaining({
        event: 'fynch.event',
        action: 'form_lead',
        specifics: 'Fluent Forms ID: ff-42',
      }),
    );
  });

  it('does not track FluentForms when originalEvent is present', async () => {
    await import('../../../src/listeners/forms/index');

    const mockEvent = { originalEvent: new Event('submit') };
    const mockData = { config: { id: 'ff-42' } };
    triggerJQueryEvent(jQueryMock._handlers, 'fluentform_submission_success', mockEvent, mockData);

    const formLeads = window.dataLayer.filter(
      (e) => e.event === 'fynch.event' && e.action === 'form_lead',
    );
    expect(formLeads).toHaveLength(0);
  });

  it('tracks Formidable Forms submissions', async () => {
    await import('../../../src/listeners/forms/index');

    const mockForm = document.createElement('div');
    triggerJQueryEvent(jQueryMock._handlers, 'frmFormComplete', {}, mockForm);

    expect(window.dataLayer).toContainEqual(
      expect.objectContaining({
        event: 'fynch.event',
        action: 'form_lead',
        specifics: 'Formidable Forms: Test Form',
      }),
    );
  });

  it('tracks Forminator Forms submissions', async () => {
    await import('../../../src/listeners/forms/index');

    const mockTarget = document.createElement('form');
    mockTarget.setAttribute('data-form-id', 'forminator-99');
    const mockEvent = { target: mockTarget };
    triggerJQueryEvent(jQueryMock._handlers, 'forminator:form:submit:success', mockEvent);

    expect(window.dataLayer).toContainEqual(
      expect.objectContaining({
        event: 'fynch.event',
        action: 'form_lead',
        specifics: 'Forminator Forms ID: forminator-99',
      }),
    );
  });

  it('tracks Ninja Forms submissions', async () => {
    await import('../../../src/listeners/forms/index');

    const mockResponse = { id: 'ninja-7' };
    triggerJQueryEvent(jQueryMock._handlers, 'nfFormSubmitResponse', {}, mockResponse);

    expect(window.dataLayer).toContainEqual(
      expect.objectContaining({
        event: 'fynch.event',
        action: 'form_lead',
        specifics: 'Ninja Forms ID: ninja-7',
      }),
    );
  });

  it('tracks WP Forms submissions', async () => {
    await import('../../../src/listeners/forms/index');

    const mockTarget = document.createElement('form');
    mockTarget.setAttribute('data-formid', 'wp-55');
    const mockEvent = { target: mockTarget };
    triggerJQueryEvent(jQueryMock._handlers, 'wpformsAjaxSubmitSuccess', mockEvent);

    expect(window.dataLayer).toContainEqual(
      expect.objectContaining({
        event: 'fynch.event',
        action: 'form_lead',
        specifics: 'WP Forms ID: wp-55',
      }),
    );
  });

  it('tracks WS Form submissions', async () => {
    await import('../../../src/listeners/forms/index');

    triggerJQueryEvent(jQueryMock._handlers, 'wsf-submit-success', {}, {}, 'ws-form-12');

    expect(window.dataLayer).toContainEqual(
      expect.objectContaining({
        event: 'fynch.event',
        action: 'form_lead',
        specifics: 'WS Form ID: ws-form-12',
      }),
    );
  });

  it('tracks Divi form submissions via ajaxSuccess', async () => {
    // Mock window.location.href
    const originalHref = window.location.href;

    await import('../../../src/listeners/forms/index');

    const mockXhr = { status: 200 };
    const mockReq = {
      url: originalHref,
      type: 'POST',
      data: 'et_pb_contactform_submit=true&et_pb_contactform_name=test',
    };
    const mockData = '<div></div>';

    triggerJQueryEvent(jQueryMock._handlers, 'ajaxSuccess', {}, mockXhr, mockReq, mockData);

    expect(window.dataLayer).toContainEqual(
      expect.objectContaining({
        event: 'fynch.event',
        action: 'form_lead',
        specifics: 'Divi Form',
      }),
    );
  });
});
