import { describe, it, expect, beforeEach } from 'vitest';
import { sendFynchEvent } from '../../src/utilities/send-fynch-event';

describe('sendFynchEvent', () => {
  beforeEach(() => {
    window.dataLayer = [];
  });

  it('initializes dataLayer if not present', () => {
    expect(Array.isArray(window.dataLayer)).toBe(true);
  });

  it('pushes a fynch.event entry to dataLayer', () => {
    sendFynchEvent('email_clicked', 'test@example.com');

    expect(window.dataLayer).toContainEqual({
      event: 'fynch.event',
      action: 'email_clicked',
      specifics: 'test@example.com',
    });
  });

  it('pushes exactly one entry per call', () => {
    sendFynchEvent('phone_clicked', '+1234567890');

    expect(window.dataLayer).toHaveLength(1);
  });

  it('preserves existing dataLayer entries', () => {
    window.dataLayer.push({ event: 'existing', action: 'test', specifics: '' });

    sendFynchEvent('sms_clicked', '+1234567890');

    expect(window.dataLayer).toHaveLength(2);
    expect(window.dataLayer[0]).toEqual({ event: 'existing', action: 'test', specifics: '' });
  });
});
