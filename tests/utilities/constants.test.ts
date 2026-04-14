import { describe, it, expect } from 'vitest';
import { CLICK_EMAIL, CLICK_PHONE, CLICK_SMS, FORM_LEAD } from '../../src/utilities/constants';

describe('constants', () => {
  it('exports correct event names', () => {
    expect(CLICK_EMAIL).toBe('email_clicked');
    expect(CLICK_PHONE).toBe('phone_clicked');
    expect(CLICK_SMS).toBe('sms_clicked');
    expect(FORM_LEAD).toBe('form_lead');
  });
});
