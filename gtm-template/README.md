# Fynch — Google Tag Manager Custom Template

`template.tpl` is a GTM **Custom Tag Template** that loads Fynch from a CDN. It's an
alternative to the Custom HTML snippet in the [main README](../README.md) for teams
that want a one-click, gallery-installable tag with explicit, GTM-enforced permissions.

Fynch is zero-config: the template only injects the script, and Fynch attaches its own
listeners and pushes events to the `dataLayer` on load under event names of the form
`fynch.<action>` (e.g. `fynch.form_lead`), with the event details under a `fynch` object
(read in GTM as `fynch.<param>`). There is nothing to call or configure after it loads.

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
   pick **Pin a specific version** and enter an exact release such as `0.3.0`.
3. Optionally switch the **CDN** (jsDelivr / unpkg).
4. **Triggering →** fire on **Initialization - All Pages** (once per page is enough;
   the URL is used as the injection cache token, so a re-fire won't double-load).

## Wiring Fynch to GA4 (example container)

A ready-made, **PII-safe** example container is at
[`example-ga4-container.json`](example-ga4-container.json). Import it (or copy the pieces)
to get Fynch events into GA4 with the `context` roll-up sanitised. Every ID, the domain,
the phone/email, and the GA4 Measurement ID in it are placeholders — replace them.

**What it sets up**

- **Fynch | Initialisation Tag** — the custom template, on _All Pages_.
- **GA4 | Google Tag** + **GA4 | Fynch Events Tag** — a GA4 event tag firing on every Fynch
  event (Custom Event trigger, regex `^fynch\.`), naming the GA4 event from `fynch.action`
  and sending one `context` parameter.
- **Variables** — Data Layer Variables for `fynch.action` and `fynch.context`, a Lookup
  Table to (optionally) rename actions, the contact Lookup Table, and the **`Fynch | Context
(GA4-safe)`** gating variable.

**How the PII-safe context works.** The GA4 tag sends `context` = `{{Fynch | Context
(GA4-safe)}}`, a Custom JavaScript variable:

```js
function () {
  var action = {{Fynch | Action Variable}};
  var isContact = /^click_to_(call|text|email|message)$/.test(action);
  return isContact ? {{Fynch | Context Mapping Variable}} : {{Fynch | Context Variable}};
}
```

- **Contact clicks** (`click_to_email`/`call`/`text`/`message`) go through the **Context
  Mapping Variable** — a Lookup Table with **no default value**, so a number/address is only
  ever sent if you've mapped it to a label; anything unmapped sends nothing. A raw phone or
  email never reaches GA4.
- **Every other event** passes its `fynch.context` through unchanged (form name, provider,
  scroll depth, domain — none of it PII).

**Set it up**

1. **Import:** GTM → _Admin → Import Container_ → choose the file → target a workspace →
   **Merge**. GTM remaps the placeholder account/container IDs to yours on import.
2. Replace **GA4 | Measurement ID** with your `G-XXXXXXXXXX`.
3. Fill the **Fynch | Context Mapping Variable** Lookup Table with your contact points. Keys
   are the **normalised** `context` value: phone → digits only, email → lower-cased,
   WhatsApp/Messenger → the full `context` string.

   | Input (`fynch.context`)                 | Output       |
   | --------------------------------------- | ------------ |
   | `0755982622`                            | `Main Phone` |
   | `info@example.com`                      | `Info Email` |
   | `whatsapp \| https://wa.me/61712345678` | `WhatsApp`   |

4. In **GA4 → Admin → Custom definitions**, register an event-scoped custom dimension with
   parameter name **`context`**, or it won't show in reports.
5. Check **GA4 → Data streams → Enhanced measurement**: Fynch overlaps GA4's built-in
   `scroll`, outbound `click`, `file_download`, and form events. Turn those off if Fynch is
   your source of truth, to avoid double-counting.

Then publish the workspace.

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

When a new Fynch version ships, update `LATEST_VERSION` in the sandboxed code, re-run the
template tests, and re-publish. The default-version test asserts against `LATEST_VERSION`,
so it will flag a mismatch. Leave the `___INFO___` `version` at `1` — that's GTM's template
format version, not a release number, and GTM rejects any other value on import.
