# Fynch — Google Tag Manager Custom Template

`template.tpl` is a GTM **Custom Tag Template** that loads Fynch from a CDN. It's an
alternative to the Custom HTML snippet in the [main README](../README.md) for teams
that want a one-click, gallery-installable tag with explicit, GTM-enforced permissions.

Fynch is zero-config: the template only injects the script, and Fynch attaches its own
listeners and pushes `fynch.event` entries to the `dataLayer` on load. There is nothing
to call or configure after it loads.

## Installing the template

**From a container export / this repo**

1. In GTM: **Templates → Tag Templates → New → ⋮ → Import**.
2. Select `template.tpl`.
3. Save.

**From the Community Template Gallery** (once published)

- **Templates → Search Gallery → “Fynch Event Tracking” → Add to workspace**.

## Using the tag

1. **Tags → New →** choose **Fynch Event Tracking**.
2. Leave **Version** on _Use the version bundled with this template_ (recommended), or
   pick **Pin a specific version** and enter an exact release such as `0.1.2`.
3. Optionally switch the **CDN** (jsDelivr / unpkg).
4. **Triggering →** fire on **Initialization - All Pages** (once per page is enough;
   the URL is used as the injection cache token, so a re-fire won't double-load).

## How the version option works

- **Use the version bundled with this template** resolves to a `LATEST_VERSION`
  constant baked into the template's sandboxed code — the newest Fynch release _at the
  time the template was published_. It never changes on its own. To move to a newer
  Fynch, update this template to its latest version and re-publish.
- **Pin a specific version** loads exactly what you type, independent of template
  updates. Use this when you need to lock behaviour to a known release.

## Trade-off vs the Custom HTML snippet

GTM's sandboxed `injectScript` API **cannot set a Subresource Integrity (SRI) hash** —
the template loads the script without one. The main README's Custom HTML embed keeps
`integrity` + `crossorigin`, so if SRI is a hard requirement, prefer that snippet.
The template's advantages are gallery distribution, a version dropdown, GTM-enforced
host permissions, and working in containers where Custom HTML tags are disabled.

## Maintaining the template

When a new Fynch version ships, update `LATEST_VERSION` in the sandboxed code, bump
`version` in the `___INFO___` block, re-run the template tests, and re-publish. The
default-version test asserts against `LATEST_VERSION`, so it will flag a mismatch.
