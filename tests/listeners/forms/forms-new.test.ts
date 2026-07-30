import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('form-listeners (new platforms)', () => {
  beforeEach(() => {
    window.dataLayer = [];
    vi.resetModules();
  });

  describe('Squarespace forms', () => {
    function createSquarespaceForm(buttonTag: 'input' | 'button' = 'input') {
      const wrapper = document.createElement('div');
      wrapper.classList.add('form-wrapper');
      const submitButton = document.createElement(buttonTag);
      submitButton.type = 'submit';
      wrapper.appendChild(submitButton);
      document.body.appendChild(wrapper);
      return { wrapper, submitButton };
    }

    it('tracks Squarespace form submission after submit click and DOM change', async () => {
      const { register } = await import('../../../src/listeners/forms/squarespace');
      register();

      const { wrapper, submitButton } = createSquarespaceForm();
      submitButton.click();

      const successElement = document.createElement('div');
      successElement.classList.add('form-submission-text');
      wrapper.appendChild(successElement);

      await vi.waitFor(() => {
        expect(window.dataLayer).toContainEqual(
          expect.objectContaining({
            event: 'fynch.form_lead',
            fynch: expect.objectContaining({
              action: 'form_lead',
              provider: 'squarespace',
            }),
          }),
        );
      });

      wrapper.remove();
    });

    it('tracks submissions from button[type=submit] submit buttons', async () => {
      const { register } = await import('../../../src/listeners/forms/squarespace');
      register();

      const { wrapper, submitButton } = createSquarespaceForm('button');
      submitButton.click();

      const successElement = document.createElement('div');
      successElement.classList.add('form-submission-text');
      wrapper.appendChild(successElement);

      await vi.waitFor(() => {
        expect(window.dataLayer).toContainEqual(
          expect.objectContaining({
            fynch: expect.objectContaining({
              action: 'form_lead',
              provider: 'squarespace',
            }),
          }),
        );
      });

      wrapper.remove();
    });

    it('does not track when success element appears without submit click', async () => {
      const { register } = await import('../../../src/listeners/forms/squarespace');
      register();

      const successElement = document.createElement('div');
      successElement.classList.add('form-submission-text');
      document.body.appendChild(successElement);

      await new Promise((resolve) => setTimeout(resolve, 50));

      expect(window.dataLayer).toHaveLength(0);

      successElement.remove();
    });

    it('ignores submit clicks outside a Squarespace form container', async () => {
      const { register } = await import('../../../src/listeners/forms/squarespace');
      register();

      const submitButton = document.createElement('input');
      submitButton.type = 'submit';
      document.body.appendChild(submitButton);
      submitButton.click();

      const successElement = document.createElement('div');
      successElement.classList.add('form-submission-text');
      document.body.appendChild(successElement);

      await new Promise((resolve) => setTimeout(resolve, 50));

      expect(window.dataLayer).toHaveLength(0);

      submitButton.remove();
      successElement.remove();
    });

    it('does not fire when the success text appears in a different container', async () => {
      const { register } = await import('../../../src/listeners/forms/squarespace');
      register();

      const { wrapper, submitButton } = createSquarespaceForm();
      submitButton.click();

      const otherContainer = document.createElement('div');
      const successElement = document.createElement('div');
      successElement.classList.add('form-submission-text');
      otherContainer.appendChild(successElement);
      document.body.appendChild(otherContainer);

      await new Promise((resolve) => setTimeout(resolve, 50));

      expect(window.dataLayer).toHaveLength(0);

      wrapper.remove();
      otherContainer.remove();
    });
  });
});
