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

  it('tracks Elementor form submissions with metadata', async () => {
    await import('../../../src/listeners/forms/index');

    const mockForm = document.createElement('form');
    mockForm.name = 'contact-form';
    const formIdInput = document.createElement('input');
    formIdInput.name = 'form_id';
    formIdInput.value = 'elem-42';
    mockForm.appendChild(formIdInput);
    const formNameInput = document.createElement('input');
    formNameInput.name = 'form_name';
    formNameInput.value = 'My Elementor Form';
    mockForm.appendChild(formNameInput);

    const mockEvent = { target: mockForm };
    triggerJQueryEvent(jQueryMock._handlers, 'submit_success', mockEvent);

    expect(window.dataLayer).toContainEqual(
      expect.objectContaining({
        event: 'fynch.event',
        action: 'form_lead',
        provider: 'elementor',
        form_id: 'elem-42',
        form_name: 'My Elementor Form',
      }),
    );
  });

  it('tracks FluentForms submissions when originalEvent is undefined', async () => {
    const wrapper = document.createElement('div');
    wrapper.className = 'fluentform-wrapper';
    const title = document.createElement('div');
    title.className = 'fluentform-title';
    title.textContent = 'Newsletter Signup';
    wrapper.appendChild(title);
    const formEl = document.createElement('form');
    formEl.id = 'fluentform_ff-42';
    wrapper.appendChild(formEl);
    document.body.appendChild(wrapper);

    await import('../../../src/listeners/forms/index');

    const mockEvent = {};
    const mockData = { config: { id: 'ff-42' }, response: { data: { entry_id: 'entry-101' } } };
    triggerJQueryEvent(jQueryMock._handlers, 'fluentform_submission_success', mockEvent, mockData);

    expect(window.dataLayer).toContainEqual(
      expect.objectContaining({
        event: 'fynch.event',
        action: 'form_lead',
        provider: 'fluent-forms',
        form_id: 'ff-42',
        lead_id: 'entry-101',
        form_name: 'Newsletter Signup',
      }),
    );

    wrapper.remove();
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
        provider: 'formidable',
        form_name: 'Test Form',
      }),
    );
  });

  it('tracks Forminator Forms submissions', async () => {
    await import('../../../src/listeners/forms/index');

    const mockTarget = document.createElement('form');
    mockTarget.setAttribute('data-form-id', 'forminator-99');
    const mockEvent = { target: mockTarget };
    triggerJQueryEvent(jQueryMock._handlers, 'forminator:form:submit:success', mockEvent, {
      formName: 'Feedback Form',
    });

    expect(window.dataLayer).toContainEqual(
      expect.objectContaining({
        event: 'fynch.event',
        action: 'form_lead',
        provider: 'forminator',
        form_id: 'forminator-99',
        form_name: 'Feedback Form',
      }),
    );
  });

  it('tracks Ninja Forms submissions', async () => {
    await import('../../../src/listeners/forms/index');

    const mockResponse = {
      id: 'ninja-7',
      response: {
        data: {
          actions: { save: { entry_id: 'nf-entry-55' } },
          settings: { title: 'Contact Ninja' },
        },
      },
    };
    triggerJQueryEvent(jQueryMock._handlers, 'nfFormSubmitResponse', {}, mockResponse);

    expect(window.dataLayer).toContainEqual(
      expect.objectContaining({
        event: 'fynch.event',
        action: 'form_lead',
        provider: 'ninja-forms',
        form_id: 'ninja-7',
        lead_id: 'nf-entry-55',
        form_name: 'Contact Ninja',
      }),
    );
  });

  it('tracks WP Forms submissions', async () => {
    await import('../../../src/listeners/forms/index');

    const mockTarget = document.createElement('form');
    mockTarget.setAttribute('data-formid', 'wp-55');
    const nativeEvent = new CustomEvent('wpformsAjaxSubmitSuccess', {
      detail: { formName: 'Inquiry Form' },
    });
    const mockEvent = { target: mockTarget, originalEvent: nativeEvent };
    triggerJQueryEvent(jQueryMock._handlers, 'wpformsAjaxSubmitSuccess', mockEvent);

    expect(window.dataLayer).toContainEqual(
      expect.objectContaining({
        event: 'fynch.event',
        action: 'form_lead',
        provider: 'wp-forms',
        form_id: 'wp-55',
        form_name: 'Inquiry Form',
      }),
    );
  });

  it('tracks WS Form submissions', async () => {
    await import('../../../src/listeners/forms/index');

    triggerJQueryEvent(
      jQueryMock._handlers,
      'wsf-submit-success',
      {},
      { submission_id: 'ws-sub-77', settings: { title: 'Booking Form' } },
      'ws-form-12',
    );

    expect(window.dataLayer).toContainEqual(
      expect.objectContaining({
        event: 'fynch.event',
        action: 'form_lead',
        provider: 'ws-form',
        form_id: 'ws-form-12',
        lead_id: 'ws-sub-77',
        form_name: 'Booking Form',
      }),
    );
  });

  it('tracks Divi form submissions via ajaxSuccess', async () => {
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
        provider: 'divi',
      }),
    );
  });

  it('tracks Gravity Forms submissions', async () => {
    const wrapper = document.createElement('div');
    wrapper.id = 'gform_wrapper_gf-33';
    wrapper.setAttribute('aria-label', 'Request a Quote');
    document.body.appendChild(wrapper);

    await import('../../../src/listeners/forms/index');

    triggerJQueryEvent(jQueryMock._handlers, 'gform_confirmation_loaded', {}, 'gf-33');

    expect(window.dataLayer).toContainEqual(
      expect.objectContaining({
        event: 'fynch.event',
        action: 'form_lead',
        provider: 'gravity-forms',
        form_id: 'gf-33',
        form_name: 'Request a Quote',
      }),
    );

    wrapper.remove();
  });
});
