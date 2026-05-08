import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('chat-listeners', () => {
  beforeEach(() => {
    window.dataLayer = [];
    vi.resetModules();
    delete (window as Record<string, unknown>).Beacon;
    delete (window as Record<string, unknown>).Tawk_API;
    delete (window as Record<string, unknown>).PodiumEventsCallback;
  });

  it('tracks Beacon chat started when Beacon API is available', async () => {
    let capturedCallback: (() => void) | undefined;

    (window as Record<string, unknown>).Beacon = (
      _method: string,
      _event: string,
      callback: () => void,
    ) => {
      capturedCallback = callback;
    };

    await import('../../../src/listeners/chats/beacon');
    const { register } = await import('../../../src/listeners/chats/beacon');
    register();

    capturedCallback?.();

    expect(window.dataLayer).toContainEqual(
      expect.objectContaining({
        event: 'fynch.event',
        action: 'chat_started',
        service_provider: 'beacon',
      }),
    );
  });

  it('does not throw when Beacon API is not available', async () => {
    const { register } = await import('../../../src/listeners/chats/beacon');
    expect(() => register()).not.toThrow();
    expect(window.dataLayer).toHaveLength(0);
  });

  it('tracks Tawk.to chat started', async () => {
    const { register } = await import('../../../src/listeners/chats/tawk');
    register();

    expect(window.Tawk_API).toBeDefined();
    window.Tawk_API?.onChatStarted?.();

    expect(window.dataLayer).toContainEqual(
      expect.objectContaining({
        event: 'fynch.event',
        action: 'chat_started',
        service_provider: 'tawk',
      }),
    );
  });

  it('initializes Tawk_API if not present', async () => {
    expect(window.Tawk_API).toBeUndefined();

    const { register } = await import('../../../src/listeners/chats/tawk');
    register();

    expect(window.Tawk_API).toBeDefined();
    expect(typeof window.Tawk_API?.onChatStarted).toBe('function');
  });

  it('tracks Podium Conversation Started', async () => {
    const { register } = await import('../../../src/listeners/chats/podium');
    register();

    window.PodiumEventsCallback?.('Conversation Started', {
      'customer-name': 'Jane',
      'customer-phone': '0400000000',
      'customer-message': 'Hi there',
    });

    expect(window.dataLayer).toContainEqual(
      expect.objectContaining({
        event: 'fynch.event',
        action: 'chat_started',
        service_provider: 'podium',
      }),
    );
  });

  it('includes lead_id from Podium properties when uid is present', async () => {
    const { register } = await import('../../../src/listeners/chats/podium');
    register();

    window.PodiumEventsCallback?.('Conversation Started', {
      uid: 'conv-abc-123',
      'customer-name': 'Jane',
    });

    expect(window.dataLayer).toContainEqual(
      expect.objectContaining({
        action: 'chat_started',
        service_provider: 'podium',
        lead_id: 'conv-abc-123',
      }),
    );
  });

  it('omits lead_id when Podium properties have no uid', async () => {
    const { register } = await import('../../../src/listeners/chats/podium');
    register();

    window.PodiumEventsCallback?.('Conversation Started', {
      'customer-name': 'Jane',
    });

    const event = window.dataLayer.find((e) => e.service_provider === 'podium');
    expect(event?.lead_id).toBeUndefined();
  });

  it('ignores non-conversation Podium events', async () => {
    const { register } = await import('../../../src/listeners/chats/podium');
    register();

    window.PodiumEventsCallback?.('Bubble Clicked', {});
    window.PodiumEventsCallback?.('Widget Closed', {});

    expect(window.dataLayer).toHaveLength(0);
  });

  it('preserves existing PodiumEventsCallback', async () => {
    const existingCallback = vi.fn();
    window.PodiumEventsCallback = existingCallback;

    const { register } = await import('../../../src/listeners/chats/podium');
    register();

    const props = { 'customer-name': 'Jane' };
    window.PodiumEventsCallback?.('Conversation Started', props);

    expect(existingCallback).toHaveBeenCalledWith('Conversation Started', props);
    expect(window.dataLayer).toHaveLength(1);
  });
});
