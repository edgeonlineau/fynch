import { describe, it, expect } from 'vitest';
import { deriveContext } from '../../src/utilities/derive-context';
import {
  CHAT_STARTED,
  CLICK_CTA,
  CLICK_DOWNLOAD,
  CLICK_EMAIL,
  CLICK_MESSAGING,
  CLICK_OUTBOUND,
  CLICK_PHONE,
  FORM_LEAD,
  SCROLL_MILESTONE,
} from '../../src/utilities/constants';

describe('deriveContext', () => {
  it('uses the raw address/number for contact clicks', () => {
    expect(deriveContext(CLICK_EMAIL, { link_url: 'sales@example.com' })).toBe('sales@example.com');
    expect(deriveContext(CLICK_PHONE, { link_url: '+61298765432' })).toBe('+61298765432');
  });

  it('joins provider and destination for messaging links', () => {
    expect(
      deriveContext(CLICK_MESSAGING, {
        provider: 'whatsapp',
        link_url: 'https://wa.me/15551234567',
      }),
    ).toBe('whatsapp | https://wa.me/15551234567');
  });

  it('joins domain and link text for outbound clicks', () => {
    expect(
      deriveContext(CLICK_OUTBOUND, { link_domain: 'example.com', link_text: 'Read more' }),
    ).toBe('example.com | Read more');
  });

  it('drops an empty part rather than leaving a dangling separator', () => {
    expect(deriveContext(CLICK_OUTBOUND, { link_domain: 'example.com' })).toBe('example.com');
    expect(deriveContext(CLICK_OUTBOUND, { link_domain: 'example.com', link_text: '' })).toBe(
      'example.com',
    );
  });

  it('joins label and url for CTAs, degrading to the label alone', () => {
    expect(
      deriveContext(CLICK_CTA, { link_text: 'Get a quote', link_url: 'https://x.com/quote' }),
    ).toBe('Get a quote | https://x.com/quote');
    expect(deriveContext(CLICK_CTA, { link_text: 'Get a quote' })).toBe('Get a quote');
  });

  it('uses the file name for downloads', () => {
    expect(deriveContext(CLICK_DOWNLOAD, { file_name: 'brochure.pdf' })).toBe('brochure.pdf');
  });

  it('joins provider and form name, falling back to form id then provider alone', () => {
    expect(deriveContext(FORM_LEAD, { provider: 'gravity-forms', form_name: 'Contact Us' })).toBe(
      'gravity-forms | Contact Us',
    );
    expect(deriveContext(FORM_LEAD, { provider: 'gravity-forms', form_id: '12' })).toBe(
      'gravity-forms | 12',
    );
    expect(deriveContext(FORM_LEAD, { provider: 'gravity-forms' })).toBe('gravity-forms');
  });

  it('stringifies the scroll milestone', () => {
    expect(deriveContext(SCROLL_MILESTONE, { percent_scrolled: 90 })).toBe('90');
  });

  it('uses the provider for channel events', () => {
    expect(deriveContext(CHAT_STARTED, { provider: 'beacon' })).toBe('beacon');
  });

  it('returns undefined when no source value is present', () => {
    expect(deriveContext(FORM_LEAD, undefined)).toBeUndefined();
    expect(deriveContext(CLICK_EMAIL, {})).toBeUndefined();
  });
});
