import { describe, it, expect } from 'vitest';
import {
  EVENTS,
  CLICK_EMAIL_EVENT,
  CLICK_PHONE_EVENT,
  CLICK_SMS_EVENT,
  FORM_LEAD_EVENT,
} from '../../src/utilities/constants';

describe('constants', () => {
  it('exports correct event names', () => {
    expect(CLICK_EMAIL_EVENT).toBe('email_clicked');
    expect(CLICK_PHONE_EVENT).toBe('phone_clicked');
    expect(CLICK_SMS_EVENT).toBe('sms_clicked');
    expect(FORM_LEAD_EVENT).toBe('form_lead');
  });

  it('EVENTS object contains all event actions', () => {
    expect(EVENTS).toStrictEqual({
      CLICK_EMAIL: 'email_clicked',
      CLICK_PHONE: 'phone_clicked',
      CLICK_SMS: 'sms_clicked',
      FORM_LEAD: 'form_lead',
    });
  });

  it('individual exports match EVENTS object values', () => {
    expect(CLICK_EMAIL_EVENT).toBe(EVENTS.CLICK_EMAIL);
    expect(CLICK_PHONE_EVENT).toBe(EVENTS.CLICK_PHONE);
    expect(CLICK_SMS_EVENT).toBe(EVENTS.CLICK_SMS);
    expect(FORM_LEAD_EVENT).toBe(EVENTS.FORM_LEAD);
  });
});
