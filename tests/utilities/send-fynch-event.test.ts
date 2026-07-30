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

  // Each event produces two pushes: a `{ fynch: null }` reset followed by the
  // real `{ event: 'fynch.<action>', fynch: {...} }`. Tests assert on the real
  // events, so filter to entries that carry a fynch event name.
  function fynchEvents() {
    return window.dataLayer.filter(
      (e) => typeof e.event === 'string' && e.event.startsWith('fynch.'),
    );
  }

  it('initializes dataLayer if not present', () => {
    expect(Array.isArray(window.dataLayer)).toBe(true);
  });

  it('names the event fynch.<action> and carries page context under fynch', async () => {
    const sendFynchEvent = await loadSendFynchEvent();
    sendFynchEvent('click_to_email', { link_url: 'mailto:test@example.com' });

    expect(fynchEvents()).toHaveLength(1);
    const event = fynchEvents()[0];
    expect(event.event).toBe('fynch.click_to_email');
    expect(event.fynch?.action).toBe('click_to_email');
    expect(event.fynch?.link_url).toBe('mailto:test@example.com');
    expect(event.fynch?.page_url).toBe(window.location.href);
    expect(event.fynch?.page_title).toBe(document.title);
    expect(event.fynch?.page_path).toBe(window.location.pathname);
    expect(event.fynch?.referrer).toBe(document.referrer);
    expect(event.fynch?.timestamp).toBeDefined();
  });

  it('resets the fynch namespace before each event to prevent stale bleed', async () => {
    const sendFynchEvent = await loadSendFynchEvent();
    sendFynchEvent('click_to_email', { link_url: 'mailto:test@example.com' });

    // The push immediately before the event clears the namespace so a prior
    // event's params cannot linger in GTM's merged data model.
    const eventIndex = window.dataLayer.findIndex((e) => e.event === 'fynch.click_to_email');
    expect(eventIndex).toBeGreaterThan(0);
    expect(window.dataLayer[eventIndex - 1]).toEqual({ fynch: null });
  });

  it('pushes event with action only when no params given', async () => {
    const sendFynchEvent = await loadSendFynchEvent();
    sendFynchEvent('scroll_milestone');

    expect(fynchEvents()).toHaveLength(1);
    expect(fynchEvents()[0].fynch?.action).toBe('scroll_milestone');
  });

  it('preserves existing dataLayer entries', async () => {
    window.dataLayer.push({
      event: 'existing',
      action: 'test',
      page_url: '',
      page_title: '',
      page_path: '',
      referrer: '',
      timestamp: '',
    });

    const sendFynchEvent = await loadSendFynchEvent();
    sendFynchEvent('click_to_text', { link_url: 'sms:+1234567890' });

    expect(window.dataLayer[0].event).toBe('existing');
    expect(fynchEvents()).toHaveLength(1);
  });

  it('includes event params when provided', async () => {
    const sendFynchEvent = await loadSendFynchEvent();
    sendFynchEvent('form_lead', {
      provider: 'contact-form-7',
      form_id: '123',
    });

    const event = fynchEvents()[0];
    expect(event.fynch?.provider).toBe('contact-form-7');
    expect(event.fynch?.form_id).toBe('123');
  });

  it('does not include params fields when not provided', async () => {
    const sendFynchEvent = await loadSendFynchEvent();
    sendFynchEvent('click_to_email');

    const event = fynchEvents()[0];
    expect(event.fynch?.provider).toBeUndefined();
    expect(event.fynch?.form_name).toBeUndefined();
  });

  it('omits form_name when not provided in params', async () => {
    const sendFynchEvent = await loadSendFynchEvent();
    sendFynchEvent('start_chat', {
      provider: 'beacon',
    });

    const event = fynchEvents()[0];
    expect(event.fynch?.provider).toBe('beacon');
    expect(event.fynch?.form_name).toBeUndefined();
  });

  it('includes click params when provided', async () => {
    const sendFynchEvent = await loadSendFynchEvent();
    sendFynchEvent('click_to_email', {
      link_url: 'mailto:click-test@example.com',
      link_text: 'Email Us',
      link_id: 'contact-cta',
      link_classes: 'btn',
    });

    const event = fynchEvents()[0];
    expect(event.fynch?.link_url).toBe('mailto:click-test@example.com');
    expect(event.fynch?.link_text).toBe('Email Us');
    expect(event.fynch?.link_id).toBe('contact-cta');
    expect(event.fynch?.link_classes).toBe('btn');
  });

  it('omits undefined params fields', async () => {
    const sendFynchEvent = await loadSendFynchEvent();
    sendFynchEvent('outbound_click', {
      link_url: 'https://example.com',
      link_domain: 'example.com',
    });

    const event = fynchEvents()[0];
    expect(event.fynch?.link_url).toBe('https://example.com');
    expect(event.fynch?.link_domain).toBe('example.com');
    expect(event.fynch?.link_text).toBeUndefined();
    expect(event.fynch?.link_id).toBeUndefined();
    expect(event.fynch?.file_name).toBeUndefined();
  });

  it('drops params passed with an explicitly undefined value', async () => {
    const sendFynchEvent = await loadSendFynchEvent();
    sendFynchEvent('form_lead', {
      provider: 'test-provider',
      form_id: 'f-1',
      lead_id: undefined,
      form_name: undefined,
    });

    const event = fynchEvents()[0];
    expect(event.fynch?.provider).toBe('test-provider');
    expect(Object.keys(event.fynch ?? {})).not.toContain('lead_id');
    expect(Object.keys(event.fynch ?? {})).not.toContain('form_name');
  });

  it('exposes nonEmptyString for param extraction', async () => {
    const { nonEmptyString } = await import('../../src/utilities/send-fynch-event');

    expect(nonEmptyString('abc')).toBe('abc');
    expect(nonEmptyString(123)).toBe('123');
    expect(nonEmptyString('')).toBeUndefined();
    expect(nonEmptyString(null)).toBeUndefined();
    expect(nonEmptyString(undefined)).toBeUndefined();
  });

  it('deduplicates identical events within 500ms', async () => {
    const sendFynchEvent = await loadSendFynchEvent();
    sendFynchEvent('click_to_email', { link_url: 'mailto:test@example.com' });
    sendFynchEvent('click_to_email', { link_url: 'mailto:test@example.com' });

    expect(fynchEvents()).toHaveLength(1);
  });

  it('allows same action after dedup window expires', async () => {
    const sendFynchEvent = await loadSendFynchEvent();
    sendFynchEvent('click_to_email', { link_url: 'mailto:test@example.com' });
    vi.advanceTimersByTime(501);
    sendFynchEvent('click_to_email', { link_url: 'mailto:test@example.com' });

    expect(fynchEvents()).toHaveLength(2);
  });

  it('allows different params within dedup window', async () => {
    const sendFynchEvent = await loadSendFynchEvent();
    sendFynchEvent('click_to_email', { link_url: 'mailto:a@example.com' });
    sendFynchEvent('click_to_email', { link_url: 'mailto:b@example.com' });

    expect(fynchEvents()).toHaveLength(2);
  });

  it('deduplicates events with no params', async () => {
    const sendFynchEvent = await loadSendFynchEvent();
    sendFynchEvent('start_chat', { provider: 'beacon' });
    sendFynchEvent('start_chat', { provider: 'beacon' });

    expect(fynchEvents()).toHaveLength(1);
  });

  it('includes ISO 8601 timestamp', async () => {
    const now = new Date('2026-04-14T10:00:00.000Z');
    vi.setSystemTime(now);

    const sendFynchEvent = await loadSendFynchEvent();
    sendFynchEvent('click_to_email');

    expect(fynchEvents()[0].fynch?.timestamp).toBe('2026-04-14T10:00:00.000Z');
  });
});
