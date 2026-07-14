import { describe, it, expect } from 'vitest';
import { classifyLink } from '../../../src/listeners/clicks/classify-link';

function classify(href: string, downloadAttr?: string | null) {
  return classifyLink(new URL(href), downloadAttr);
}

describe('classifyLink', () => {
  describe('directions', () => {
    it.each([
      ['https://google.com/maps/place/abc', 'google'],
      ['https://google.co.uk/maps?q=cafe', 'google'],
      ['https://google.com.au/maps?q=cafe', 'google'],
      ['https://maps.google.com/?q=cafe', 'google'],
      ['https://maps.google.co.uk/?q=cafe', 'google'],
      ['https://goo.gl/maps/abc123', 'google'],
      ['https://maps.apple.com/?q=cafe', 'apple'],
      ['https://waze.com/ul?ll=1,2', 'waze'],
      ['https://www.waze.com/ul?ll=1,2', 'waze'],
      ['https://g.page/my-business', 'google-business'],
    ])('classifies %s as directions/%s', (href, provider) => {
      const result = classify(href);
      expect(result?.action).toBe('get_directions');
      expect(result?.params.provider).toBe(provider);
    });

    it('does not classify google.com/search as directions', () => {
      const result = classify('https://google.com/search?q=cafe');
      expect(result?.action).toBe('outbound_click');
    });

    it('does not classify goo.gl without /maps as directions', () => {
      const result = classify('https://goo.gl/abc123');
      expect(result?.action).toBe('outbound_click');
    });

    it.each([
      'https://google.evil.com/maps?q=cafe',
      'https://maps.google.evil.com/?q=cafe',
      'https://google.com.evil.net/maps',
    ])('does not classify lookalike host %s as directions', (href) => {
      const result = classify(href);
      expect(result?.action).toBe('outbound_click');
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
      expect(result?.action).toBe('click_to_message');
      expect(result?.params.provider).toBe(channel);
    });

    it('matches a messaging host with a query string', () => {
      const result = classify('https://wa.me/15551234567?text=hello%20there');
      expect(result?.action).toBe('click_to_message');
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
      expect(result?.action).toBe('app_store_click');
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
      expect(result?.action).toBe('add_to_calendar');
      expect(result?.params.provider).toBe(provider);
    });

    it('does not classify a bare calendar.google.com path as calendar', () => {
      const result = classify('https://calendar.google.com/settings');
      expect(result?.action).toBe('outbound_click');
    });
  });

  describe('download attribute', () => {
    it('classifies an extensionless internal link with a download attribute as download', () => {
      const result = classify(`${window.location.origin}/export/report`, '');
      expect(result?.action).toBe('download_file_click');
      expect(result?.params.file_name).toBeUndefined();
      expect(result?.params.file_extension).toBeUndefined();
    });

    it('uses the download attribute value for file_name and file_extension', () => {
      const result = classify(`${window.location.origin}/export/report`, 'q3-report.pdf');
      expect(result?.action).toBe('download_file_click');
      expect(result?.params.file_name).toBe('q3-report.pdf');
      expect(result?.params.file_extension).toBe('pdf');
    });

    it('reports file_name without extension for an extensionless download attribute', () => {
      const result = classify(`${window.location.origin}/export/report`, 'q3-report');
      expect(result?.action).toBe('download_file_click');
      expect(result?.params.file_name).toBe('q3-report');
      expect(result?.params.file_extension).toBeUndefined();
    });

    it('prefers the download attribute filename over the path filename', () => {
      const result = classify('https://cdn.example.com/assets/8f3a1c.pdf', 'brochure.pdf');
      expect(result?.action).toBe('download_file_click');
      expect(result?.params.file_name).toBe('brochure.pdf');
      expect(result?.params.file_extension).toBe('pdf');
    });

    it('falls back to the path filename when the download attribute is empty', () => {
      const result = classify('https://cdn.example.com/assets/file.pdf', '');
      expect(result?.params.file_name).toBe('file.pdf');
      expect(result?.params.file_extension).toBe('pdf');
    });

    it('classifies a blob URL with a download attribute as download', () => {
      const result = classify('blob:https://example.com/8f3a1c2e', 'export.csv');
      expect(result?.action).toBe('download_file_click');
      expect(result?.params.file_name).toBe('export.csv');
      expect(result?.params.file_extension).toBe('csv');
    });

    it('classifies an external link with a download attribute as download, not outbound', () => {
      const result = classify('https://external-site.com/generated/asset', '');
      expect(result?.action).toBe('download_file_click');
    });

    it('still classifies an .ics link with a download attribute as calendar', () => {
      const result = classify('https://example.com/events/invite.ics', 'invite.ics');
      expect(result?.action).toBe('add_to_calendar');
      expect(result?.params.provider).toBe('ics');
    });
  });

  describe('precedence', () => {
    it('classifies an .ics link as calendar, not download or outbound', () => {
      const result = classify('https://files.example.com/invite.ics');
      expect(result?.action).toBe('add_to_calendar');
      expect(result?.params.provider).toBe('ics');
    });

    it('still classifies a regular download by extension', () => {
      const result = classify('https://cdn.example.com/assets/file.pdf');
      expect(result?.action).toBe('download_file_click');
      expect(result?.params.file_name).toBe('file.pdf');
      expect(result?.params.file_extension).toBe('pdf');
    });

    it('falls back to outbound for an unmatched external link', () => {
      const result = classify('https://external-site.com/page');
      expect(result?.action).toBe('outbound_click');
      expect(result?.params.link_domain).toBe('external-site.com');
    });
  });

  it('returns null for an unmatched internal link', () => {
    const result = classify(`${window.location.origin}/about`);
    expect(result).toBeNull();
  });
});
