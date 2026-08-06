# Wiring Fynch to GA4 (PII-safe)

A ready-made example GTM container is at
[`example-ga4-container.json`](example-ga4-container.json). Import it (or copy the pieces)
to get Fynch events into GA4 with the `fynch.context` roll-up sanitised. Every ID, the
domain, the phone/email, and the GA4 Measurement ID in it are placeholders — replace them.

## What it sets up

- **Fynch | Initialisation Tag** — the [Fynch GTM custom
  template](https://github.com/edgeonlineau/fynch-gtm-template), on _All Pages_.
- **GA4 | Google Tag** + **GA4 | Fynch Events Tag** — a GA4 event tag firing on every Fynch
  event (Custom Event trigger, regex `^fynch\.`), naming the GA4 event from `fynch.action`
  and sending one `context` parameter.
- **Variables** — Data Layer Variables for `fynch.action` and `fynch.context`, a Lookup
  Table to (optionally) rename actions, the contact Lookup Table, and the **`Fynch | Context
(GA4-safe)`** gating variable.

## How the PII-safe context works

The GA4 tag sends `context` = `{{Fynch | Context (GA4-safe)}}`, a Custom JavaScript
variable:

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

## Set it up

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
