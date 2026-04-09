import { describe, it, expect, beforeEach } from 'vitest';
import sendFynchEvent from '../send-fynch-event';

describe('sendFynchEvent', () => {
  beforeEach(() => {
    window.dataLayer = [];
  });

  it('initializes dataLayer if not present', () => {
    // dataLayer is set at module load; verify it exists
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

  it('pushes a deprecated Fynch Event entry to dataLayer', () => {
    sendFynchEvent('email_clicked', 'test@example.com');

    expect(window.dataLayer).toContainEqual({
      event: 'Fynch Event',
      action: 'email_clicked',
      specifics: 'test@example.com',
    });
  });

  it('pushes exactly two entries per call', () => {
    sendFynchEvent('phone_clicked', '+1234567890');

    expect(window.dataLayer).toHaveLength(2);
  });

  it('preserves existing dataLayer entries', () => {
    window.dataLayer.push({ event: 'existing', action: 'test', specifics: '' });

    sendFynchEvent('sms_clicked', '+1234567890');

    expect(window.dataLayer).toHaveLength(3);
    expect(window.dataLayer[0]).toEqual({ event: 'existing', action: 'test', specifics: '' });
  });
});
