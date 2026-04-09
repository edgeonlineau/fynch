import { describe, it, expect } from 'vitest';
import {
  CLICK_EMAIL_EVENT,
  CLICK_PHONE_EVENT,
  CLICK_SMS_EVENT,
  FORM_LEAD_EVENT,
} from '../constants';

describe('constants', () => {
  it('exports correct event names', () => {
    expect(CLICK_EMAIL_EVENT).toBe('email_clicked');
    expect(CLICK_PHONE_EVENT).toBe('phone_clicked');
    expect(CLICK_SMS_EVENT).toBe('sms_clicked');
    expect(FORM_LEAD_EVENT).toBe('form_lead');
  });
});
