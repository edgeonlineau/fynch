import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('booking-listeners', () => {
  beforeEach(() => {
    window.dataLayer = [];
    vi.resetModules();
    delete (window as Record<string, unknown>).crmForm;
  });

  it('tracks Calendly event_scheduled via postMessage', async () => {
    const { register } = await import('../../../src/listeners/bookings/calendly');
    register();

    const event = new MessageEvent('message', {
      origin: 'https://calendly.com',
      data: { event: 'calendly.event_scheduled' },
    });
    window.dispatchEvent(event);

    expect(window.dataLayer).toContainEqual(
      expect.objectContaining({
        event: 'fynch.event',
        action: 'booking_scheduled',
        service_provider: 'calendly',
      }),
    );
  });

  it('ignores non-scheduled Calendly events', async () => {
    const { register } = await import('../../../src/listeners/bookings/calendly');
    register();

    const event = new MessageEvent('message', {
      origin: 'https://calendly.com',
      data: { event: 'calendly.event_type_viewed' },
    });
    window.dispatchEvent(event);

    expect(window.dataLayer).toHaveLength(0);
  });

  it('ignores messages from non-Calendly origins', async () => {
    const { register } = await import('../../../src/listeners/bookings/calendly');
    register();

    const event = new MessageEvent('message', {
      origin: 'https://evil.com',
      data: { event: 'calendly.event_scheduled' },
    });
    window.dispatchEvent(event);

    expect(window.dataLayer).toHaveLength(0);
  });

  it('tracks NowBookIt Booking Confirmed via postMessage', async () => {
    const { register } = await import('../../../src/listeners/bookings/nowbookit');
    register();

    const event = new MessageEvent('message', {
      origin: 'https://bookings.nowbookit.com',
      data: JSON.stringify({
        type: 'NBIWidget2GoogleAnalytics',
        event: { event_action: 'Booking Confirmed' },
        data: { bookingId: 'NBI-67890' },
      }),
    });
    window.dispatchEvent(event);

    expect(window.dataLayer).toContainEqual(
      expect.objectContaining({
        event: 'fynch.event',
        action: 'booking_scheduled',
        service_provider: 'nowbookit',
        lead_id: 'NBI-67890',
      }),
    );
  });

  it('ignores NowBookIt events that are not Booking Confirmed', async () => {
    const { register } = await import('../../../src/listeners/bookings/nowbookit');
    register();

    const event = new MessageEvent('message', {
      origin: 'https://bookings.nowbookit.com',
      data: JSON.stringify({
        type: 'NBIWidget2GoogleAnalytics',
        event: { event_action: 'Widget Opened' },
      }),
    });
    window.dispatchEvent(event);

    expect(window.dataLayer).toHaveLength(0);
  });

  it('ignores NowBookIt messages with invalid JSON', async () => {
    const { register } = await import('../../../src/listeners/bookings/nowbookit');
    register();

    const event = new MessageEvent('message', {
      origin: 'https://bookings.nowbookit.com',
      data: 'not-valid-json{',
    });
    window.dispatchEvent(event);

    expect(window.dataLayer).toHaveLength(0);
  });

  it('tracks OpenTable reservation-made via postMessage', async () => {
    const { register } = await import('../../../src/listeners/bookings/opentable');
    register();

    const event = new MessageEvent('message', {
      origin: 'https://www.opentable.com.au',
      data: { type: 'reservation-made', confirmation_number: 'OT-12345' },
    });
    window.dispatchEvent(event);

    expect(window.dataLayer).toContainEqual(
      expect.objectContaining({
        event: 'fynch.event',
        action: 'booking_scheduled',
        service_provider: 'opentable',
        lead_id: 'OT-12345',
      }),
    );
  });

  it('matches OpenTable from any TLD', async () => {
    const { register } = await import('../../../src/listeners/bookings/opentable');
    register();

    const event = new MessageEvent('message', {
      origin: 'https://www.opentable.com',
      data: { type: 'reservation-made', confirmation_number: 'OT-99999' },
    });
    window.dispatchEvent(event);

    expect(window.dataLayer).toContainEqual(
      expect.objectContaining({
        action: 'booking_scheduled',
        service_provider: 'opentable',
        lead_id: 'OT-99999',
      }),
    );
  });

  it('ignores non-reservation OpenTable events', async () => {
    const { register } = await import('../../../src/listeners/bookings/opentable');
    register();

    const event = new MessageEvent('message', {
      origin: 'https://www.opentable.com.au',
      data: { type: 'APP_READY' },
    });
    window.dispatchEvent(event);

    expect(window.dataLayer).toHaveLength(0);
  });

  it('tracks LineLeader tour booking when crmForm exists', async () => {
    (window as Record<string, unknown>).crmForm = { callback: undefined };

    const { register } = await import('../../../src/listeners/bookings/lineleader');
    register();

    window.crmForm?.callback?.('lead-123');

    expect(window.dataLayer).toContainEqual(
      expect.objectContaining({
        event: 'fynch.event',
        action: 'booking_scheduled',
        service_provider: 'lineleader',
        lead_id: 'lead-123',
      }),
    );
  });

  it('preserves existing crmForm callback', async () => {
    const existingCallback = vi.fn();
    (window as Record<string, unknown>).crmForm = { callback: existingCallback };

    const { register } = await import('../../../src/listeners/bookings/lineleader');
    register();

    window.crmForm?.callback?.('lead-456');

    expect(existingCallback).toHaveBeenCalledWith('lead-456');
    expect(window.dataLayer).toHaveLength(1);
  });

  it('does not throw when crmForm is not available', async () => {
    const { register } = await import('../../../src/listeners/bookings/lineleader');
    expect(() => register()).not.toThrow();
    expect(window.dataLayer).toHaveLength(0);
  });
});
