import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';

describe('sendFynchEvent', () => {
  beforeEach(() => {
    window.dataLayer = [];
    vi.useFakeTimers();
    vi.resetModules();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  async function loadSendFynchEvent() {
    const mod = await import('../../src/utilities/send-fynch-event');
    return mod.sendFynchEvent;
  }

  it('initializes dataLayer if not present', () => {
    expect(Array.isArray(window.dataLayer)).toBe(true);
  });

  it('pushes a fynch.event entry to dataLayer with page context', async () => {
    const sendFynchEvent = await loadSendFynchEvent();
    sendFynchEvent('email_clicked', 'test@example.com');

    expect(window.dataLayer).toHaveLength(1);
    const event = window.dataLayer[0];
    expect(event.event).toBe('fynch.event');
    expect(event.action).toBe('email_clicked');
    expect(event.specifics).toBe('test@example.com');
    expect(event.page_url).toBe(window.location.href);
    expect(event.page_title).toBe(document.title);
    expect(event.page_path).toBe(window.location.pathname);
    expect(event.referrer).toBe(document.referrer);
    expect(event.timestamp).toBeDefined();
  });

  it('pushes exactly one entry per call', async () => {
    const sendFynchEvent = await loadSendFynchEvent();
    sendFynchEvent('phone_clicked', '+1234567890');

    expect(window.dataLayer).toHaveLength(1);
  });

  it('preserves existing dataLayer entries', async () => {
    window.dataLayer.push({
      event: 'existing',
      action: 'test',
      specifics: '',
      page_url: '',
      page_title: '',
      page_path: '',
      referrer: '',
      timestamp: '',
    });

    const sendFynchEvent = await loadSendFynchEvent();
    sendFynchEvent('sms_clicked', '+1234567890');

    expect(window.dataLayer).toHaveLength(2);
    expect(window.dataLayer[0].event).toBe('existing');
  });

  it('includes event params when provided', async () => {
    const sendFynchEvent = await loadSendFynchEvent();
    sendFynchEvent('form_lead', 'Contact Form 7 ID: 123', {
      service_provider: 'contact-form-7',
      form_id: '123',
    });

    const event = window.dataLayer[0];
    expect(event.service_provider).toBe('contact-form-7');
    expect(event.form_id).toBe('123');
  });

  it('does not include event params when not provided', async () => {
    const sendFynchEvent = await loadSendFynchEvent();
    sendFynchEvent('email_clicked', 'test@example.com');

    const event = window.dataLayer[0];
    expect(event.service_provider).toBeUndefined();
    expect(event.form_name).toBeUndefined();
  });

  it('omits form_name when not provided in params', async () => {
    const sendFynchEvent = await loadSendFynchEvent();
    sendFynchEvent('chat_started', 'Beacon Chat', {
      service_provider: 'beacon',
    });

    const event = window.dataLayer[0];
    expect(event.service_provider).toBe('beacon');
    expect(event.form_name).toBeUndefined();
  });

  it('includes click params when provided', async () => {
    const sendFynchEvent = await loadSendFynchEvent();
    sendFynchEvent('email_clicked', 'click-test@example.com', {
      link_url: 'mailto:click-test@example.com',
      link_text: 'Email Us',
      link_id: 'contact-cta',
      link_classes: 'btn',
    });

    const event = window.dataLayer[0];
    expect(event.link_url).toBe('mailto:click-test@example.com');
    expect(event.link_text).toBe('Email Us');
    expect(event.link_id).toBe('contact-cta');
    expect(event.link_classes).toBe('btn');
  });

  it('omits undefined params fields', async () => {
    const sendFynchEvent = await loadSendFynchEvent();
    sendFynchEvent('outbound_link_clicked', 'https://example.com', {
      link_url: 'https://example.com',
      link_domain: 'example.com',
    });

    const event = window.dataLayer[0];
    expect(event.link_url).toBe('https://example.com');
    expect(event.link_domain).toBe('example.com');
    expect(event.link_text).toBeUndefined();
    expect(event.link_id).toBeUndefined();
    expect(event.file_name).toBeUndefined();
  });

  it('deduplicates identical events within 500ms', async () => {
    const sendFynchEvent = await loadSendFynchEvent();
    sendFynchEvent('email_clicked', 'test@example.com');
    sendFynchEvent('email_clicked', 'test@example.com');

    expect(window.dataLayer).toHaveLength(1);
  });

  it('allows same event after dedup window expires', async () => {
    const sendFynchEvent = await loadSendFynchEvent();
    sendFynchEvent('email_clicked', 'test@example.com');
    vi.advanceTimersByTime(501);
    sendFynchEvent('email_clicked', 'test@example.com');

    expect(window.dataLayer).toHaveLength(2);
  });

  it('allows different events within dedup window', async () => {
    const sendFynchEvent = await loadSendFynchEvent();
    sendFynchEvent('email_clicked', 'a@example.com');
    sendFynchEvent('email_clicked', 'b@example.com');

    expect(window.dataLayer).toHaveLength(2);
  });

  it('includes ISO 8601 timestamp', async () => {
    const now = new Date('2026-04-14T10:00:00.000Z');
    vi.setSystemTime(now);

    const sendFynchEvent = await loadSendFynchEvent();
    sendFynchEvent('email_clicked', 'test@example.com');

    expect(window.dataLayer[0].timestamp).toBe('2026-04-14T10:00:00.000Z');
  });
});
