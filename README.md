# Fynch

Fynch is a zero-config, browser-side event-tracking library. You drop a single script
(`fynch.js`) onto a page and it automatically detects meaningful user interactions —
link clicks, form submissions, scroll depth, chat starts, and bookings — then pushes a
normalised event onto the Google Tag Manager `dataLayer`. There is no API to call: the
script attaches its listeners on load and emits events as they happen.

Every event is published as a `fynch.event` entry on `window.dataLayer`, ready to be
picked up by a Google Tag Manager trigger.

---

## Installation

Embed the bundled script on any page where you want tracking. Make sure your GTM snippet
(which creates `window.dataLayer`) is present — Fynch will create the array if it is
missing, but GTM needs it to receive events.

Fynch is published to npm, so you can load it straight from a CDN — no build or
hosting required. The recommended production embed pins an exact version, uses
`defer` so the script never blocks HTML parsing, and carries a Subresource
Integrity hash so a compromised CDN response can't execute:

```html
<!-- jsDelivr, pinned + deferred + SRI (recommended for production) -->
<script
  defer
  src="https://cdn.jsdelivr.net/npm/@edgeonline/fynch@0.1.0/dist/fynch.js"
  integrity="sha384-mhY6/MQ5PfO0b8WItD/ADE/CdOzrrewwFYPIOtoxyh0klMFiqetIp9DJ2/cwoAvo"
  crossorigin="anonymous"
></script>

<!-- unpkg works too (same file, same integrity hash) -->
<script
  defer
  src="https://unpkg.com/@edgeonline/fynch@0.1.0/dist/fynch.js"
  integrity="sha384-mhY6/MQ5PfO0b8WItD/ADE/CdOzrrewwFYPIOtoxyh0klMFiqetIp9DJ2/cwoAvo"
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

Every event Fynch pushes has the same envelope:

```js
{
  event: 'fynch.event',   // constant — use this as your GTM trigger
  action: '<event_name>',  // one of the 14 actions below
  // page context (always present):
  page_url:   'https://example.com/pricing?ref=x',
  page_title: 'Pricing — Example',
  page_path:  '/pricing',
  referrer:   'https://google.com/',
  timestamp:  '2026-06-18T03:21:09.482Z',  // ISO 8601
  // ...plus event-specific params (see the tables below)
}
```

**Common fields on every event:** `event`, `action`, `page_url`, `page_title`,
`page_path`, `referrer`, `timestamp`. The per-event tables below list only the
_additional_ params for each action.

**Deduplication.** Identical events fired within **500ms** of each other are suppressed,
so rapid double-clicks or duplicate platform callbacks won't double-count. Form leads have
an additional dedup check to prevent the same submission being reported twice.

### Example

A click on `<a href="https://wa.me/15551234567">Chat on WhatsApp</a>` pushes:

```js
{
  event: 'fynch.event',
  action: 'click_to_message',
  page_url: 'https://example.com/contact',
  page_title: 'Contact — Example',
  page_path: '/contact',
  referrer: '',
  timestamp: '2026-06-18T03:21:09.482Z',
  provider: 'whatsapp',
  link_url: 'https://wa.me/15551234567',
  link_text: 'Chat on WhatsApp'
}
```

---

## Events reference

There are 14 event actions, grouped into five categories below. Page-context fields
(listed above) are present on all of them and are not repeated in the tables.

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
| `app_store_click`      | an app store link (Apple App Store, Google Play)                           | `provider`                                  |
| `add_to_calendar`      | an add-to-calendar link (Google, Outlook, AddToCalendar, AddEvent, `.ics`) | `provider`                                  |
| `download_file_click`  | a link to a downloadable file (see extensions below)                       | `file_name`, `file_extension`               |
| `outbound_click`       | a link to an external domain                                               | `link_domain`                               |
| `call_to_action_click` | an element marked with the `data-fynch-cta` attribute                      | `link_domain` (when the target is external) |

**Marking a CTA.** Add `data-fynch-cta` to any element you want tracked as a call to
action. Fynch resolves the clicked target up to the nearest tagged ancestor (and into a
nested anchor for the URL where applicable).

**Detection coverage:**

- **Downloadable extensions:** `.pdf`, `.doc`, `.docx`, `.xls`, `.xlsx`, `.csv`, `.zip`,
  `.rar`, `.gz`, `.tar`, `.ppt`, `.pptx`, `.exe`, `.dmg`, `.apk`
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
per page load.

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

| Param              | Meaning                                                                         |
| ------------------ | ------------------------------------------------------------------------------- |
| `event`            | Always `fynch.event`. Use as the GTM trigger.                                   |
| `action`           | The event name — one of the 14 actions above.                                   |
| `page_url`         | Full page URL (`window.location.href`) at the time of the event.                |
| `page_title`       | Document title (`document.title`).                                              |
| `page_path`        | URL path (`window.location.pathname`).                                          |
| `referrer`         | `document.referrer` (empty string if none).                                     |
| `timestamp`        | ISO 8601 timestamp of when the event fired.                                     |
| `provider`         | The detected platform/channel (e.g. `whatsapp`, `gravity-forms`, `calendly`).   |
| `form_id`          | Platform form identifier, when available.                                       |
| `form_name`        | Human-readable form name, when available.                                       |
| `lead_id`          | Submission / conversation / booking identifier, when the platform provides one. |
| `link_url`         | The clicked link's `href`.                                                      |
| `link_text`        | The link's visible text (trimmed, max 100 chars).                               |
| `link_id`          | The link element's `id`.                                                        |
| `link_classes`     | The link element's class list.                                                  |
| `link_domain`      | Hostname of an external/outbound link.                                          |
| `file_name`        | Filename of a downloaded file (last URL path segment).                          |
| `file_extension`   | Extension of a downloaded file (without the leading dot).                       |
| `percent_scrolled` | Scroll-depth milestone reached: `25`, `50`, `75`, or `90`.                      |

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
