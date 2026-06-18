import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('form-listeners (new platforms)', () => {
  beforeEach(() => {
    window.dataLayer = [];
    vi.resetModules();
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
            provider: 'squarespace',
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
