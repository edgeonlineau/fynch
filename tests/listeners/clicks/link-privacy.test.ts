import { describe, it, expect } from 'vitest';
import { normalisePersonalLinkUrl } from '../../../src/listeners/clicks/link-privacy';

describe('normalisePersonalLinkUrl', () => {
  describe('scheme stripping', () => {
    it.each([
      ['mailto:hello@example.com', 'hello@example.com'],
      ['tel:+61298765432', '+61298765432'],
      ['callto:+61298765432', '+61298765432'],
      ['sms:+61400111222', '+61400111222'],
    ])('normalises %s to %s', (href, expected) => {
      expect(normalisePersonalLinkUrl(href)).toBe(expected);
    });

    it('matches schemes case-insensitively', () => {
      expect(normalisePersonalLinkUrl('MAILTO:hello@example.com')).toBe('hello@example.com');
      expect(normalisePersonalLinkUrl('TEL:+61298765432')).toBe('+61298765432');
    });

    it('gives tel: and callto: links to the same number an identical link_url', () => {
      expect(normalisePersonalLinkUrl('tel:+15551234567')).toBe(
        normalisePersonalLinkUrl('callto:+15551234567'),
      );
    });
  });

  describe('query stripping', () => {
    it('strips ?subject and everything after it from mailto links', () => {
      expect(normalisePersonalLinkUrl('mailto:sydney@biz.com?subject=Hi&body=user+text')).toBe(
        'sydney@biz.com',
      );
    });

    it('strips ?body from sms links', () => {
      expect(normalisePersonalLinkUrl('sms:+61400111222?body=hey%20there')).toBe('+61400111222');
    });

    it('strips legacy iOS &body and ;body sms separators', () => {
      expect(normalisePersonalLinkUrl('sms:+61400111222&body=hey')).toBe('+61400111222');
      expect(normalisePersonalLinkUrl('sms:+61400111222;body=hey')).toBe('+61400111222');
    });

    it('strips tel: parameters such as ;ext=', () => {
      expect(normalisePersonalLinkUrl('tel:+61298765432;ext=204')).toBe('+61298765432');
    });

    it('sends only the bare scheme-stripped value when the address itself is empty', () => {
      expect(normalisePersonalLinkUrl('mailto:?body=share%20this')).toBe('');
    });
  });

  describe('percent decoding', () => {
    it('decodes percent-encoded characters in the address', () => {
      expect(normalisePersonalLinkUrl('tel:+61%202%209876%205432')).toBe('+61 2 9876 5432');
    });

    it('returns the raw value when percent decoding fails', () => {
      expect(normalisePersonalLinkUrl('tel:+61%ZZ123')).toBe('+61%ZZ123');
    });
  });

  it('keeps multiple mailto recipients', () => {
    expect(normalisePersonalLinkUrl('mailto:a@x.com,b@y.com')).toBe('a@x.com,b@y.com');
  });

  it.each([
    'https://example.com/page?q=1',
    'whatsapp://send?phone=15551234567',
    'maps://?q=cafe',
    '/relative/path',
  ])('leaves non-personal href %s untouched', (href) => {
    expect(normalisePersonalLinkUrl(href)).toBe(href);
  });
});
