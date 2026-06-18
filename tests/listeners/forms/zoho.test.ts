import { describe, it, expect, beforeAll, beforeEach } from 'vitest';

describe('Zoho forms listener', () => {
  beforeAll(async () => {
    const { register } = await import('../../../src/listeners/forms/zoho');
    register();
  });

  beforeEach(() => {
    window.dataLayer = [];
  });

  function postZoho(data: unknown, origin = 'https://forms.zohopublic.com'): void {
    window.dispatchEvent(new MessageEvent('message', { data, origin }));
  }

  function zohoLeads(): DataLayerEvent[] {
    return window.dataLayer.filter(
      (e) => e.event === 'fynch.event' && e.action === 'form_lead' && e.provider === 'zoho',
    );
  }

  it('tracks a Zoho form submission from iframe postMessage', () => {
    const permalink = 'zoho-basic-' + Math.random().toString(36).slice(2);
    postZoho(`${permalink}|1573.6458740234375`);

    expect(zohoLeads()).toContainEqual(
      expect.objectContaining({
        event: 'fynch.event',
        action: 'form_lead',
        provider: 'zoho',
        form_id: permalink,
      }),
    );
  });

  it('tracks each successive submission of the same form (one event per postMessage)', async () => {
    const permalink = 'zoho-repeat-' + Math.random().toString(36).slice(2);
    const heights = ['1573.6458740234375', '1166', '1086', '1130', '1194.9000244140625'];

    for (const height of heights) {
      postZoho(`${permalink}|${height}`);
      // Zoho has no lead_id so it falls into Tier 2 form-identity dedup
      // (2s window keyed on provider + form_id). Space submissions
      // beyond that window so each is treated as distinct.
      await new Promise((resolve) => setTimeout(resolve, 2100));
    }

    const matching = zohoLeads().filter((e) => e.form_id === permalink);
    expect(matching).toHaveLength(heights.length);
  }, 20_000);

  it('suppresses identical same-tick duplicates via the 500ms event dedup', () => {
    const permalink = 'zoho-sametick-' + Math.random().toString(36).slice(2);

    postZoho(`${permalink}|1573`);
    postZoho(`${permalink}|1573`);

    const matching = zohoLeads().filter((e) => e.form_id === permalink);
    expect(matching).toHaveLength(1);
  });

  it('tracks each distinct Zoho form on the same page', () => {
    const permA = 'zoho-multi-A-' + Math.random().toString(36).slice(2);
    const permB = 'zoho-multi-B-' + Math.random().toString(36).slice(2);

    postZoho(`${permA}|1573.6458740234375`);
    postZoho(`${permB}|872.6875`);

    const leads = zohoLeads().filter((e) => e.form_id === permA || e.form_id === permB);
    expect(leads).toHaveLength(2);
    expect(leads.map((e) => e.form_id)).toEqual([permA, permB]);
  });

  it('ignores postMessages from non-Zoho origins', () => {
    const permalink = 'zoho-foreign-' + Math.random().toString(36).slice(2);
    postZoho(`${permalink}|1573`, 'https://evil.example.com');

    expect(zohoLeads().some((e) => e.form_id === permalink)).toBe(false);
  });

  it('ignores malformed Zoho postMessages', () => {
    const before = zohoLeads().length;

    postZoho('not-pipe-delimited');
    postZoho('permalink|not-a-number');
    postZoho('|123');
    postZoho({ some: 'object' });

    expect(zohoLeads()).toHaveLength(before);
  });

  it('accepts regional Zoho origins (e.g. .com.au, .eu)', () => {
    const permAu = 'zoho-au-' + Math.random().toString(36).slice(2);
    const permEu = 'zoho-eu-' + Math.random().toString(36).slice(2);

    postZoho(`${permAu}|800`, 'https://forms.zohopublic.com.au');
    postZoho(`${permEu}|800`, 'https://forms.zohopublic.eu');

    const formIds = new Set(zohoLeads().map((e) => e.form_id));
    expect(formIds.has(permAu)).toBe(true);
    expect(formIds.has(permEu)).toBe(true);
  });
});
