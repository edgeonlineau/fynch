const PERSONAL_URI_SCHEME_PATTERN = /^(mailto|tel|callto|sms):/i;

// ? starts a query (RFC 5724/6068); ; and & are legacy iOS sms body
// separators and tel parameter markers (e.g. ;ext=).
const PERSONAL_URI_PARAMS_PATTERN = /[?;&]/;

function safeDecode(value: string): string {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

/**
 * For mailto:/tel:/callto:/sms: hrefs, reduce link_url to just the address or
 * number: the scheme is redundant (the event action already carries it, and
 * stripping it merges tel:/callto: links to the same number), and query/body
 * params are dropped because prefilled subject/body content can embed
 * visitor-specific data that must not reach the dataLayer. The address itself
 * is the business's published contact detail, so it is kept for visibility
 * over which location's link was clicked. Other hrefs pass through untouched.
 */
export function normalisePersonalLinkUrl(href: string): string {
  const match = PERSONAL_URI_SCHEME_PATTERN.exec(href);
  if (!match) return href;
  const address = href.slice(match[0].length).split(PERSONAL_URI_PARAMS_PATTERN, 1)[0];
  return safeDecode(address);
}
