import { describe, it, expect } from 'vitest';
import {
  CLICK_EMAIL,
  CLICK_PHONE,
  CLICK_SMS,
  CLICK_OUTBOUND,
  CLICK_DOWNLOAD,
  CLICK_CTA,
  FORM_LEAD,
  SCROLL_MILESTONE,
  CHAT_STARTED,
  BOOKING_SCHEDULED,
  DOWNLOAD_EXTENSIONS,
} from '../../src/utilities/constants';

describe('constants', () => {
  it('exports correct event action names', () => {
    expect(CLICK_EMAIL).toBe('email_clicked');
    expect(CLICK_PHONE).toBe('phone_clicked');
    expect(CLICK_SMS).toBe('sms_clicked');
    expect(CLICK_OUTBOUND).toBe('outbound_link_clicked');
    expect(CLICK_DOWNLOAD).toBe('file_downloaded');
    expect(CLICK_CTA).toBe('cta_clicked');
    expect(FORM_LEAD).toBe('form_lead');
    expect(SCROLL_MILESTONE).toBe('scroll_milestone');
    expect(CHAT_STARTED).toBe('chat_started');
    expect(BOOKING_SCHEDULED).toBe('booking_scheduled');
  });

  it('exports download extensions array', () => {
    expect(DOWNLOAD_EXTENSIONS).toContain('.pdf');
    expect(DOWNLOAD_EXTENSIONS).toContain('.zip');
    expect(DOWNLOAD_EXTENSIONS).toContain('.doc');
    expect(DOWNLOAD_EXTENSIONS.length).toBeGreaterThan(0);
  });
});
