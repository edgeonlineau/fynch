import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('form-listeners (new platforms)', () => {
  beforeEach(() => {
    window.dataLayer = [];
    vi.resetModules();
  });

  describe('XAP iframe forms', () => {
    it('tracks XAP iframe form submission via postMessage', async () => {
      const { register } = await import('../../../src/listeners/forms/xap');
      register();

      const event = new MessageEvent('message', {
        data: JSON.stringify({
          type: 'IFRAME_DATA_LAYER_EVENT',
          event: 'iframe_form_submission',
          selected_location: 'Brisbane',
        }),
      });
      window.dispatchEvent(event);

      expect(window.dataLayer).toContainEqual(
        expect.objectContaining({
          event: 'fynch.event',
          action: 'form_lead',
          service_provider: 'xap',
          form_name: 'Brisbane',
        }),
      );
    });

    it('uses fallback form name when location is missing', async () => {
      const { register } = await import('../../../src/listeners/forms/xap');
      register();

      const event = new MessageEvent('message', {
        data: JSON.stringify({
          type: 'IFRAME_DATA_LAYER_EVENT',
          event: 'iframe_form_submission',
        }),
      });
      window.dispatchEvent(event);

      expect(window.dataLayer).toContainEqual(
        expect.objectContaining({
          form_name: 'XAP Form',
        }),
      );
    });

    it('ignores non-IFRAME_DATA_LAYER_EVENT messages', async () => {
      const { register } = await import('../../../src/listeners/forms/xap');
      register();

      const event = new MessageEvent('message', {
        data: JSON.stringify({
          type: 'SOME_OTHER_EVENT',
          event: 'iframe_form_submission',
        }),
      });
      window.dispatchEvent(event);

      expect(window.dataLayer).toHaveLength(0);
    });

    it('ignores invalid JSON in postMessage', async () => {
      const { register } = await import('../../../src/listeners/forms/xap');
      register();

      const event = new MessageEvent('message', {
        data: 'not-json{',
      });
      window.dispatchEvent(event);

      expect(window.dataLayer).toHaveLength(0);
    });

    it('ignores non-string message data', async () => {
      const { register } = await import('../../../src/listeners/forms/xap');
      register();

      const event = new MessageEvent('message', {
        data: { type: 'IFRAME_DATA_LAYER_EVENT' },
      });
      window.dispatchEvent(event);

      expect(window.dataLayer).toHaveLength(0);
    });
  });

  describe('Squarespace forms', () => {
    it('tracks Squarespace form submission after submit click and DOM change', async () => {
      const { register } = await import('../../../src/listeners/forms/squarespace');
      register();

      const submitButton = document.createElement('input');
      submitButton.type = 'submit';
      document.body.appendChild(submitButton);

      submitButton.click();

      const successElement = document.createElement('div');
      successElement.classList.add('form-submission-text');
      document.body.appendChild(successElement);

      await vi.waitFor(() => {
        expect(window.dataLayer).toContainEqual(
          expect.objectContaining({
            event: 'fynch.event',
            action: 'form_lead',
            service_provider: 'squarespace',
          }),
        );
      });

      document.body.removeChild(submitButton);
      document.body.removeChild(successElement);
    });

    it('does not track when success element appears without submit click', async () => {
      const { register } = await import('../../../src/listeners/forms/squarespace');
      register();

      const successElement = document.createElement('div');
      successElement.classList.add('form-submission-text');
      document.body.appendChild(successElement);

      await new Promise((resolve) => setTimeout(resolve, 50));

      expect(window.dataLayer).toHaveLength(0);

      document.body.removeChild(successElement);
    });
  });
});
