import { describe, it, expect } from 'vitest';
import { classifyLink } from '../../../src/listeners/clicks/classify-link';

function classify(href: string) {
  return classifyLink(new URL(href));
}

describe('classifyLink', () => {
  describe('directions', () => {
    it.each([
      ['https://google.com/maps/place/abc', 'google'],
      ['https://google.co.uk/maps?q=cafe', 'google'],
      ['https://maps.google.com/?q=cafe', 'google'],
      ['https://goo.gl/maps/abc123', 'google'],
      ['https://maps.apple.com/?q=cafe', 'apple'],
      ['https://waze.com/ul?ll=1,2', 'waze'],
      ['https://www.waze.com/ul?ll=1,2', 'waze'],
      ['https://g.page/my-business', 'google-business'],
    ])('classifies %s as directions/%s', (href, provider) => {
      const result = classify(href);
      expect(result?.action).toBe('directions_clicked');
      expect(result?.params.provider).toBe(provider);
    });

    it('does not classify google.com/search as directions', () => {
      const result = classify('https://google.com/search?q=cafe');
      expect(result?.action).toBe('outbound_link_clicked');
    });

    it('does not classify goo.gl without /maps as directions', () => {
      const result = classify('https://goo.gl/abc123');
      expect(result?.action).toBe('outbound_link_clicked');
    });
  });

  describe('messaging apps', () => {
    it.each([
      ['https://wa.me/15551234567', 'whatsapp'],
      ['https://api.whatsapp.com/send?phone=15551234567', 'whatsapp'],
      ['https://web.whatsapp.com/send?phone=15551234567', 'whatsapp'],
      ['https://m.me/mypage', 'messenger'],
      ['https://ig.me/m/myhandle', 'instagram'],
    ])('classifies %s as messaging/%s', (href, channel) => {
      const result = classify(href);
      expect(result?.action).toBe('messaging_app_clicked');
      expect(result?.params.provider).toBe(channel);
    });

    it('matches a messaging host with a query string', () => {
      const result = classify('https://wa.me/15551234567?text=hello%20there');
      expect(result?.action).toBe('messaging_app_clicked');
      expect(result?.params.provider).toBe('whatsapp');
    });
  });

  describe('app store', () => {
    it.each([
      ['https://apps.apple.com/us/app/x/id123', 'apple'],
      ['https://itunes.apple.com/us/app/x/id123', 'apple'],
      ['https://play.google.com/store/apps/details?id=com.x', 'google'],
    ])('classifies %s as app store/%s', (href, store) => {
      const result = classify(href);
      expect(result?.action).toBe('app_store_clicked');
      expect(result?.params.provider).toBe(store);
    });
  });

  describe('calendar', () => {
    it.each([
      ['https://example.com/events/invite.ics', 'ics'],
      ['https://calendar.google.com/calendar/render?action=TEMPLATE', 'google'],
      ['https://calendar.google.com/event?eid=abc', 'google'],
      ['https://outlook.live.com/calendar/0/deeplink/compose', 'outlook'],
      ['https://addtocalendar.com/?service=google', 'addtocalendar'],
      ['https://www.addevent.com/event/abc123', 'addevent'],
    ])('classifies %s as calendar/%s', (href, provider) => {
      const result = classify(href);
      expect(result?.action).toBe('add_to_calendar_clicked');
      expect(result?.params.provider).toBe(provider);
    });

    it('does not classify a bare calendar.google.com path as calendar', () => {
      const result = classify('https://calendar.google.com/settings');
      expect(result?.action).toBe('outbound_link_clicked');
    });
  });

  describe('precedence', () => {
    it('classifies an .ics link as calendar, not download or outbound', () => {
      const result = classify('https://files.example.com/invite.ics');
      expect(result?.action).toBe('add_to_calendar_clicked');
      expect(result?.params.provider).toBe('ics');
    });

    it('still classifies a regular download by extension', () => {
      const result = classify('https://cdn.example.com/assets/file.pdf');
      expect(result?.action).toBe('file_downloaded');
      expect(result?.params.file_name).toBe('file.pdf');
      expect(result?.params.file_extension).toBe('pdf');
    });

    it('falls back to outbound for an unmatched external link', () => {
      const result = classify('https://external-site.com/page');
      expect(result?.action).toBe('outbound_link_clicked');
      expect(result?.params.link_domain).toBe('external-site.com');
    });
  });

  it('returns null for an unmatched internal link', () => {
    const result = classify(`${window.location.origin}/about`);
    expect(result).toBeNull();
  });
});
