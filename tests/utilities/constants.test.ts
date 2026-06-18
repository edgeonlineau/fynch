import { describe, it, expect } from 'vitest';
import {
  CLICK_EMAIL,
  CLICK_PHONE,
  CLICK_SMS,
  CLICK_OUTBOUND,
  CLICK_DOWNLOAD,
  CLICK_CTA,
  CLICK_DIRECTIONS,
  CLICK_MESSAGING,
  CLICK_APP_STORE,
  CLICK_CALENDAR,
  FORM_LEAD,
  SCROLL_MILESTONE,
  CHAT_STARTED,
  BOOKING_SCHEDULED,
  DOWNLOAD_EXTENSIONS,
  MESSAGING_HOSTS,
  APP_STORE_HOSTS,
  CALENDAR_HOSTS,
} from '../../src/utilities/constants';

describe('constants', () => {
  it('exports correct event action names', () => {
    expect(CLICK_EMAIL).toBe('email_clicked');
    expect(CLICK_PHONE).toBe('phone_clicked');
    expect(CLICK_SMS).toBe('sms_clicked');
    expect(CLICK_OUTBOUND).toBe('outbound_link_clicked');
    expect(CLICK_DOWNLOAD).toBe('file_downloaded');
    expect(CLICK_CTA).toBe('cta_clicked');
    expect(CLICK_DIRECTIONS).toBe('directions_clicked');
    expect(CLICK_MESSAGING).toBe('messaging_app_clicked');
    expect(CLICK_APP_STORE).toBe('app_store_clicked');
    expect(CLICK_CALENDAR).toBe('add_to_calendar_clicked');
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

  it('maps messaging hosts to channels', () => {
    expect(MESSAGING_HOSTS['wa.me']).toBe('whatsapp');
    expect(MESSAGING_HOSTS['m.me']).toBe('messenger');
    expect(MESSAGING_HOSTS['ig.me']).toBe('instagram');
  });

  it('maps app store hosts to stores', () => {
    expect(APP_STORE_HOSTS['apps.apple.com']).toBe('apple');
    expect(APP_STORE_HOSTS['play.google.com']).toBe('google');
  });

  it('maps calendar hosts to providers', () => {
    expect(CALENDAR_HOSTS['calendar.google.com']).toBe('google');
    expect(CALENDAR_HOSTS['outlook.live.com']).toBe('outlook');
    expect(CALENDAR_HOSTS['addevent.com']).toBe('addevent');
  });
});
