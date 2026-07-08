import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('message-dispatcher', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  function post(origin: string, data: unknown = {}): void {
    window.dispatchEvent(new MessageEvent('message', { origin, data }));
  }

  it('routes messages only to handlers whose matcher accepts the origin', async () => {
    const { onTrustedMessage, exactOrigins } =
      await import('../../src/utilities/message-dispatcher');
    const calendlyHandler = vi.fn();
    const typeformHandler = vi.fn();

    onTrustedMessage(exactOrigins('https://calendly.com'), calendlyHandler);
    onTrustedMessage((origin) => origin.endsWith('.typeform.com'), typeformHandler);

    post('https://calendly.com');
    post('https://form.typeform.com');
    post('https://evil.example.com');

    expect(calendlyHandler).toHaveBeenCalledTimes(1);
    expect(typeformHandler).toHaveBeenCalledTimes(1);
  });

  it('never invokes a handler for an origin its matcher rejects', async () => {
    const { onTrustedMessage } = await import('../../src/utilities/message-dispatcher');
    const handler = vi.fn();

    onTrustedMessage(() => false, handler);

    post('https://calendly.com');
    post('https://anything.example.com');

    expect(handler).not.toHaveBeenCalled();
  });

  it('passes the original MessageEvent through to the handler', async () => {
    const { onTrustedMessage, exactOrigins } =
      await import('../../src/utilities/message-dispatcher');
    const handler = vi.fn();

    onTrustedMessage(exactOrigins('https://calendly.com'), handler);
    post('https://calendly.com', { event: 'calendly.event_scheduled' });

    const event = handler.mock.calls[0][0] as MessageEvent;
    expect(event.origin).toBe('https://calendly.com');
    expect(event.data).toEqual({ event: 'calendly.event_scheduled' });
  });

  it('registers a single window message listener across many routes', async () => {
    const addSpy = vi.spyOn(window, 'addEventListener');
    const { onTrustedMessage, exactOrigins } =
      await import('../../src/utilities/message-dispatcher');

    onTrustedMessage(exactOrigins('https://a.example.com'), vi.fn());
    onTrustedMessage(exactOrigins('https://b.example.com'), vi.fn());
    onTrustedMessage(exactOrigins('https://c.example.com'), vi.fn());

    const messageListeners = addSpy.mock.calls.filter(([type]) => type === 'message');
    expect(messageListeners).toHaveLength(1);
    addSpy.mockRestore();
  });

  it('fires every route that matches the same origin', async () => {
    const { onTrustedMessage, exactOrigins } =
      await import('../../src/utilities/message-dispatcher');
    const first = vi.fn();
    const second = vi.fn();

    onTrustedMessage(exactOrigins('https://shared.example.com'), first);
    onTrustedMessage(exactOrigins('https://shared.example.com'), second);

    post('https://shared.example.com');

    expect(first).toHaveBeenCalledTimes(1);
    expect(second).toHaveBeenCalledTimes(1);
  });

  it('exactOrigins matches listed origins and nothing else', async () => {
    const { exactOrigins } = await import('../../src/utilities/message-dispatcher');
    const matcher = exactOrigins('https://www.opentable.com', 'https://www.opentable.com.au');

    expect(matcher('https://www.opentable.com')).toBe(true);
    expect(matcher('https://www.opentable.com.au')).toBe(true);
    expect(matcher('https://www.opentable.com.evil.net')).toBe(false);
    expect(matcher('https://www.opentable.evil.com')).toBe(false);
  });
});
