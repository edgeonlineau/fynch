const PERSONAL_URI_SCHEME_PATTERN = /^(mailto|tel|callto|sms):/i;

/**
 * mailto:/tel:/callto:/sms: hrefs embed an email address or phone number.
 * Everything pushed to the dataLayer flows through GTM into every connected
 * destination (GA4, ad platforms, webhooks), so the identifier is redacted
 * down to the bare scheme — the event action already carries the intent.
 */
export function redactPersonalLinkUrl(href: string): string {
  const match = PERSONAL_URI_SCHEME_PATTERN.exec(href);
  return match ? `${match[1].toLowerCase()}:` : href;
}
