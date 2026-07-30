# Fynch

Fynch is a zero-config, browser-side event-tracking library. You drop a single script
(`fynch.js`) onto a page and it automatically detects meaningful user interactions —
link clicks, form submissions, scroll depth, chat starts, and bookings — then pushes a
normalised event onto the Google Tag Manager `dataLayer`. There is no API to call: the
script attaches its listeners on load and emits events as they happen.

Every event is published on `window.dataLayer` under an event name of `fynch.<action>`
(e.g. `fynch.form_lead`), ready to be picked up by a Google Tag Manager trigger.

---

## Installation

There are two ways to load Fynch. If you manage the site through Google Tag Manager, the
GTM custom template is the quickest path. If you'd rather embed the script yourself — or
you want Subresource Integrity — use the direct embed instead.

### Google Tag Manager custom template (recommended)

A GTM **Custom Tag Template** lives in [`gtm-template/`](gtm-template/). Add it once,
drop in a **Fynch Event Tracking** tag, and fire it on _Initialization - All Pages_ —
there's no snippet to paste and no code to maintain in the container. It gives you a
version dropdown (defaulting to the release bundled with the template), a jsDelivr/unpkg
switch, and GTM-enforced host permissions, and it works even in containers where Custom
HTML tags are disabled. See the [template README](gtm-template/README.md) for install
and usage.

The one thing it can't do is attach a Subresource Integrity hash — GTM's sandboxed
loader has no way to set one. If SRI matters to you, use the direct embed below.

### Direct script embed (alternative)

Fynch is published to npm, so you can load it straight from a CDN — no build or hosting
required. This embed pins an exact version, uses `defer` so the script never blocks HTML
parsing, and carries a Subresource Integrity hash so a compromised CDN response can't
execute:

```html
<!-- jsDelivr, pinned + deferred + SRI -->
<script
  defer
  src="https://cdn.jsdelivr.net/npm/@edgeonline/fynch@0.2.0/dist/fynch.js"
  integrity="sha384-30yfGOxjJDnndKHH1BqULWu7aMTzTucDS36hhdBUs9C2jeuqFxw6L2uYyLCaPOaZ"
  crossorigin="anonymous"
></script>

<!-- unpkg works too (same file, same integrity hash) -->
<script
  defer
  src="https://unpkg.com/@edgeonline/fynch@0.2.0/dist/fynch.js"
  integrity="sha384-30yfGOxjJDnndKHH1BqULWu7aMTzTucDS36hhdBUs9C2jeuqFxw6L2uYyLCaPOaZ"
  crossorigin="anonymous"
></script>
```

The script self-initialises on load. No configuration, options, or init call is required.

### Loading notes

- **Always use `defer` (or `async`).** Fynch only registers event listeners — it never
  renders anything — so there is no reason to let it block HTML parsing. A plain
  `<script src>` without `defer` is render-blocking and directly hurts FCP/LCP in
  PageSpeed Insights.
- **Load order doesn't matter.** Fynch re-checks for the platforms it integrates with
  (jQuery form plugins, Duda, chat and booking widgets) at `DOMContentLoaded`, at
  `window` load, and on a short poll afterwards, so it works whether it loads before
  or after those scripts.
- **Pin an exact version in production.** A floating URL such as
  `https://cdn.jsdelivr.net/npm/@edgeonline/fynch` always serves the latest release:
  behaviour can change underneath you, and it cannot be protected with an integrity
  hash. Treat unpinned URLs as development-only.
- **Generating the SRI hash for a new version:**

  ```bash
  curl -s https://cdn.jsdelivr.net/npm/@edgeonline/fynch@<version>/dist/fynch.js \
    | openssl dgst -sha384 -binary | openssl base64 -A
  ```

### Installing from npm

If you bundle your own assets instead of using a CDN:

```bash
npm install @edgeonline/fynch
```

```js
import '@edgeonline/fynch'; // side-effect import — attaches all listeners on load
```

Bundlers pick up the ESM build (`dist/fynch.mjs`) via the package `exports` map; the
IIFE build is only used for `<script>` tags.

### Building from source

The repo uses **npm**.

```bash
npm install
npm run build      # type-checks, then bundles to dist/fynch.js
```

The build produces two bundles (`es2015` target): `fynch.js`, an IIFE (global name
`FynchEventTracking`) for `<script>` tags, and `fynch.mjs`, an ES module for bundlers.

---

## The dataLayer event shape

Every event Fynch pushes has the same envelope: a top-level `event` name and a single
`fynch` object holding everything else.

```js
{
  event: 'fynch.click_to_call', // `fynch.` + the action below — your GTM trigger
  fynch: {
    action: 'click_to_call', // one of the 14 actions below
    // page context (always present):
    page_url:   'https://example.com/pricing?ref=x',
    page_title: 'Pricing — Example',
    page_path:  '/pricing',
    referrer:   'https://google.com/',
    timestamp:  '2026-06-18T03:21:09.482Z', // ISO 8601
    // ...plus event-specific params (see the tables below)
  },
}
```

**Everything except `event` lives under `fynch`.** Namespacing keeps Fynch's generic
keys (`action`, `page_title`, `link_url`, `provider`, …) from colliding with anything
else on the shared `dataLayer`, and read them in GTM with dot-notation Data Layer
Variables such as `fynch.action` or `fynch.link_url`. The `fynch` object always carries
`action`, the five page-context fields, and then the per-event params listed in the
tables below.

The `event` name always encodes the action as `fynch.<action>` (e.g. `fynch.form_lead`),
so each event is distinct in GTM's Preview / Tag Assistant view and can be matched by an
exact Custom Event trigger — see [Triggering in GTM](#triggering-in-gtm).

**Namespace reset.** GTM's data model recursively merges and retains pushed values
across events, so before each event Fynch first pushes `{ fynch: null }` to clear the
namespace. Without it, a previous event's params (say `link_url` from a click) would
linger and bleed into a later event when read as a variable. This mirrors GA4's
`ecommerce: null` reset. The reset carries no `event` key, so it never fires a trigger.

**Deduplication.** Identical events fired within **500ms** of each other are suppressed,
so rapid double-clicks or duplicate platform callbacks won't double-count. Form leads have
an additional dedup check to prevent the same submission being reported twice.

### Example

A click on `<a href="https://wa.me/15551234567">Chat on WhatsApp</a>` pushes:

```js
{
  event: 'fynch.click_to_message',
  fynch: {
    action: 'click_to_message',
    page_url: 'https://example.com/contact',
    page_title: 'Contact — Example',
    page_path: '/contact',
    referrer: '',
    timestamp: '2026-06-18T03:21:09.482Z',
    provider: 'whatsapp',
    link_url: 'https://wa.me/15551234567',
    link_text: 'Chat on WhatsApp',
  },
}
```

### Triggering in GTM

Because the event name carries the action, you have two ways to trigger, and they can
be mixed freely in one container:

- **One action → one tag.** Create a **Custom Event** trigger whose event name is the
  exact action, e.g. `fynch.form_lead`. No condition or Data Layer Variable needed. This
  is the simplest setup for wiring a specific action to a specific GA4 conversion or ad
  pixel.
- **All Fynch events → one tag.** Create a **Custom Event** trigger, tick **Use regex
  matching**, and set the event name to `^fynch\.`. Pair it with a Data Layer Variable
  reading `fynch.action` — for example, map a single GA4 event tag's name to
  `{{fynch.action}}` to forward every Fynch event with its action as the GA4 event name.

For event parameters, point each Data Layer Variable at the dot path under `fynch` (e.g.
`fynch.provider`, `fynch.link_url`) and map it to a GA4 event parameter in the tag.

---

## Events reference

There are 14 event actions, grouped into five categories below. Every param named in
these tables (including `action`) lives inside the `fynch` object — read it in GTM as
`fynch.<param>`. Page-context fields (listed above) are present on all of them and are
not repeated in the tables.

### Clicks

Fynch listens for clicks on anchor (`<a>`) elements and classifies them by scheme or
destination. **All click events also carry these params:** `link_url`, `link_text`
(trimmed, max 100 chars), `link_id`, `link_classes`.

| `action`               | Triggered when the user clicks…                                            | Additional params                           |
| ---------------------- | -------------------------------------------------------------------------- | ------------------------------------------- |
| `click_to_email`       | a `mailto:` link                                                           | —                                           |
| `click_to_call`        | a `tel:` or `callto:` link                                                 | —                                           |
| `click_to_text`        | an `sms:` link                                                             | —                                           |
| `click_to_message`     | a messaging link (WhatsApp, Messenger, Instagram)                          | `provider`                                  |
| `get_directions`       | a maps/directions link (Google Maps, Apple Maps, Waze, Google Business)    | `provider`                                  |
| `view_in_app_store`    | an app store link (Apple App Store, Google Play)                           | `provider`                                  |
| `add_to_calendar`      | an add-to-calendar link (Google, Outlook, AddToCalendar, AddEvent, `.ics`) | `provider`                                  |
| `download_file`        | a link to a downloadable file (by extension or `download` attribute)       | `file_name`, `file_extension`               |
| `outbound_click`       | a link to an external domain                                               | `link_domain`                               |
| `call_to_action_click` | an element marked with the `data-fynch-cta` attribute                      | `link_domain` (when the target is external) |

**Marking a CTA.** Add `data-fynch-cta` to any element you want tracked as a call to
action. Fynch resolves the clicked target up to the nearest tagged ancestor (and into a
nested anchor for the URL where applicable).

**Detection coverage:**

- **Downloadable extensions** (GA4 enhanced measurement's set, plus `.tar`, `.dmg`,
  `.apk`): `.pdf`, `.doc`, `.docx`, `.xls`, `.xlsx`, `.ppt`, `.pptx`, `.pps`, `.key`,
  `.txt`, `.rtf`, `.csv`, `.zip`, `.rar`, `.7z`, `.gz`, `.tar`, `.exe`, `.dmg`, `.pkg`,
  `.apk`, `.mp3`, `.wav`, `.wma`, `.mid`, `.midi`, `.avi`, `.mov`, `.mp4`, `.mpg`,
  `.mpeg`, `.wmv`. A link with a `download` attribute is always tracked as a download
  regardless of extension; a non-empty attribute value takes precedence for `file_name`.
- **Messaging hosts → `provider`:** `wa.me` / `api.whatsapp.com` / `web.whatsapp.com` →
  `whatsapp`, `m.me` → `messenger`, `ig.me` → `instagram` (plus the `whatsapp:` scheme)
- **App store hosts → `provider`:** `apps.apple.com` / `itunes.apple.com` → `apple`,
  `play.google.com` → `google`
- **Directions → `provider`:** Google Maps (`maps.google.*`, `google.*/maps`,
  `goo.gl/maps`) → `google`, Apple Maps (`maps.apple.com` and the `maps:` scheme) →
  `apple`, Waze → `waze`, `g.page` → `google-business`
- **Calendar hosts → `provider`:** `calendar.google.com` (on `/render` or `/event`) →
  `google`, `outlook.live.com` → `outlook`, `addtocalendar.com` → `addtocalendar`,
  `addevent.com` → `addevent`, any `.ics` link → `ics`

### Forms

A successful form submission emits a single action, `form_lead`, regardless of platform.

**Params:** `provider` (always), plus `form_id`, `form_name`, and `lead_id` where the
underlying platform exposes them.

| `action`    | Triggered when…                            | Params                                           |
| ----------- | ------------------------------------------ | ------------------------------------------------ |
| `form_lead` | a supported form is submitted successfully | `provider`, `form_id?`, `form_name?`, `lead_id?` |

**Supported form platforms** (`provider` value → platform):

| `provider`       | Platform           |
| ---------------- | ------------------ |
| `contact-form-7` | Contact Form 7     |
| `gravity-forms`  | Gravity Forms      |
| `hubspot-v3`     | HubSpot Forms (v3) |
| `hubspot-v4`     | HubSpot Forms (v4) |
| `ninja-forms`    | Ninja Forms        |
| `typeform`       | Typeform           |
| `squarespace`    | Squarespace Forms  |
| `zoho`           | Zoho Forms         |
| `duda`           | Duda               |
| `divi`           | Divi               |
| `elementor`      | Elementor Forms    |
| `fluent-forms`   | Fluent Forms       |
| `formidable`     | Formidable Forms   |
| `forminator`     | Forminator         |
| `wp-forms`       | WPForms            |
| `ws-form`        | WS Form            |

### Scroll

| `action`           | Triggered when…                         | Params             |
| ------------------ | --------------------------------------- | ------------------ |
| `scroll_milestone` | the user scrolls past a depth milestone | `percent_scrolled` |

`percent_scrolled` is one of `25`, `50`, `75`, or `90`. Each milestone fires at most once
per page load. If the user is already past a milestone by the time Fynch loads — a
deferred or late-injected script, or a reload that restores scroll position — those
milestones fire once on load (evaluated after `load`, against the settled page height).
Pages that fit the viewport can't be scrolled, so they emit no scroll milestones.

### Chats

Starting a conversation in a supported chat widget emits `start_chat`.

| `action`     | Triggered when…                  | Params                 |
| ------------ | -------------------------------- | ---------------------- |
| `start_chat` | a chat conversation is initiated | `provider`, `lead_id?` |

**Supported chat platforms:**

| `provider` | Platform          |
| ---------- | ----------------- |
| `beacon`   | Help Scout Beacon |
| `tawk`     | Tawk.to           |
| `podium`   | Podium            |
| `livechat` | LiveChat          |

### Bookings

Completing a reservation/booking in a supported widget emits `schedule_booking`.

| `action`           | Triggered when…        | Params                 |
| ------------------ | ---------------------- | ---------------------- |
| `schedule_booking` | a booking is confirmed | `provider`, `lead_id?` |

**Supported booking platforms:**

| `provider`   | Platform   |
| ------------ | ---------- |
| `calendly`   | Calendly   |
| `lineleader` | LineLeader |
| `nowbookit`  | NowBookit  |
| `opentable`  | OpenTable  |
| `sevenrooms` | SevenRooms |

---

## Parameter glossary

`event` is the only top-level key; everything else lives under `fynch` and is read in
GTM as `fynch.<param>`.

| Param              | Meaning                                                                                                                                                                                                                                                                                                            |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `event`            | The GTM event name (the only top-level key), always `fynch.<action>` (e.g. `fynch.form_lead`). Use as the GTM trigger — exact match for one action, or the regex `^fynch\.` for all.                                                                                                                               |
| `action`           | The action — one of the 14 below. Encodes the same value as the `event` name, exposed under `fynch` as a variable.                                                                                                                                                                                                 |
| `page_url`         | Full page URL (`window.location.href`) at the time of the event.                                                                                                                                                                                                                                                   |
| `page_title`       | Document title (`document.title`).                                                                                                                                                                                                                                                                                 |
| `page_path`        | URL path (`window.location.pathname`).                                                                                                                                                                                                                                                                             |
| `referrer`         | `document.referrer` (empty string if none).                                                                                                                                                                                                                                                                        |
| `timestamp`        | ISO 8601 timestamp of when the event fired.                                                                                                                                                                                                                                                                        |
| `provider`         | The detected platform/channel (e.g. `whatsapp`, `gravity-forms`, `calendly`).                                                                                                                                                                                                                                      |
| `form_id`          | Platform form identifier, when available.                                                                                                                                                                                                                                                                          |
| `form_name`        | Human-readable form name, when available.                                                                                                                                                                                                                                                                          |
| `lead_id`          | Submission / conversation / booking identifier, when the platform provides one.                                                                                                                                                                                                                                    |
| `link_url`         | The clicked link's `href`. For `mailto:`/`tel:`/`callto:`/`sms:` links only the address or number is sent (e.g. `+61298765432`, `sydney@biz.com`) — the scheme is dropped as redundant with the action, and any `?subject=`/`?body=` style parameters are stripped since prefilled content can carry visitor data. |
| `link_text`        | The link's visible text (trimmed, max 100 chars).                                                                                                                                                                                                                                                                  |
| `link_id`          | The link element's `id`.                                                                                                                                                                                                                                                                                           |
| `link_classes`     | The link element's class list.                                                                                                                                                                                                                                                                                     |
| `link_domain`      | Hostname of an external/outbound link.                                                                                                                                                                                                                                                                             |
| `file_name`        | Filename of a downloaded file (last URL path segment).                                                                                                                                                                                                                                                             |
| `file_extension`   | Extension of a downloaded file (without the leading dot).                                                                                                                                                                                                                                                          |
| `percent_scrolled` | Scroll-depth milestone reached: `25`, `50`, `75`, or `90`.                                                                                                                                                                                                                                                         |

> **Privacy note:** `page_url` includes the page's query string. If your URLs
> can carry sensitive parameters (password-reset tokens, OAuth callbacks,
> session identifiers), configure GTM to redact those parameters before
> forwarding events to third-party destinations.

---

## Development

The repo uses **npm**, Vite for bundling, and Vitest (with jsdom) for tests.

| Command                                   | Purpose                                       |
| ----------------------------------------- | --------------------------------------------- |
| `npm run dev`                             | Start the Vite dev server.                    |
| `npm run build`                           | Type-check, then build the `fynch.js` bundle. |
| `npm run typecheck`                       | Run `tsc --noEmit`.                           |
| `npm run lint` / `npm run lint:fix`       | Run ESLint (optionally autofix).              |
| `npm run format` / `npm run format:check` | Run Prettier (write / check).                 |
| `npm test`                                | Run the test suite once.                      |
| `npm run test:watch`                      | Run tests in watch mode.                      |
| `npm run test:coverage`                   | Run tests with coverage (80% threshold).      |
| `npm run check`                           | Prettier check + ESLint + tests (CI gate).    |
