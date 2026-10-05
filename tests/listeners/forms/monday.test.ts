import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

const submission = { source: 'workforms', type: 'submit_success' };

function postMonday(data: unknown = submission, origin = 'https://forms.monday.com'): void {
  window.dispatchEvent(new MessageEvent('message', { data, origin }));
}

function mondayLeads(): DataLayerEvent[] {
  return window.dataLayer.filter(
    (event) => event.event === 'fynch.form_lead' && event.fynch?.provider === 'monday',
  );
}

describe('Monday WorkForms listener', () => {
  let messageListener: EventListenerOrEventListenerObject | undefined;

  beforeEach(async () => {
    vi.useFakeTimers();
    vi.resetModules();
    window.dataLayer = [];
    const spy = vi.spyOn(window, 'addEventListener');
    // Import after resetModules to isolate dispatcher routes and shared dedup state.
    const { register } = await import('../../../src/listeners/forms/monday');
    register();
    messageListener = spy.mock.calls.find(([type]) => type === 'message')?.[1];
  });

  afterEach(() => {
    if (messageListener) window.removeEventListener('message', messageListener);
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it('suppresses duplicates within two seconds and allows a submission at the boundary', () => {
    postMonday();
    const firstLead = mondayLeads()[0];
    expect(firstLead).toEqual({
      event: 'fynch.form_lead',
      fynch: expect.objectContaining({ action: 'form_lead', provider: 'monday' }),
    });

    postMonday();
    vi.advanceTimersByTime(1_999);
    postMonday();

    expect(mondayLeads()).toEqual([firstLead]);

    vi.advanceTimersByTime(1);
    postMonday();
    expect(mondayLeads()).toHaveLength(2);
    expect(mondayLeads()[1]).toEqual({
      event: 'fynch.form_lead',
      fynch: expect.objectContaining({ action: 'form_lead', provider: 'monday' }),
    });
  });

  it.each([
    'https://evil.com',
    'https://forms.monday.com.evil.com',
    'https://monday.com',
    'http://forms.monday.com',
    'https://forms.monday.com:8443',
    '',
  ])('rejects origin %s without consuming the first valid submission', (origin) => {
    postMonday(submission, origin);
    expect(mondayLeads()).toEqual([]);

    postMonday();
    expect(mondayLeads()).toHaveLength(1);
  });

  it.each([
    null,
    'submit_success',
    42,
    [],
    {},
    { source: 'workforms' },
    { type: 'submit_success' },
    { source: 'other', type: 'submit_success' },
    { source: 'workforms', type: 'submit_error' },
  ])('ignores unrelated or malformed payload %j without consuming a valid submission', (data) => {
    postMonday(data);
    expect(mondayLeads()).toEqual([]);

    postMonday();
    expect(mondayLeads()).toHaveLength(1);
  });
});
