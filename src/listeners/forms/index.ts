import { register as contactForm7 } from './contact-form-7';
import { register as duda } from './duda';
import { register as hubspotV3 } from './hubspot-v3';
import { register as hubspotV4 } from './hubspot-v4';
import { register as typeform } from './typeform';
import { register as squarespace } from './squarespace';
import { register as zoho } from './zoho';
import { register as divi } from './divi';
import { register as elementor } from './elementor';
import { register as fluentForms } from './fluent-forms';
import { register as formidable } from './formidable';
import { register as forminator } from './forminator';
import { register as gravityForms } from './gravity-forms';
import { register as ninjaForms } from './ninja-forms';
import { register as wpForms } from './wp-forms';
import { register as wsForm } from './ws-form';

contactForm7();
duda();
hubspotV3();
hubspotV4();
typeform();
squarespace();
zoho();

if (typeof jQuery === 'function') {
  const $ = jQuery;
  divi($);
  elementor($);
  fluentForms($);
  formidable($);
  forminator($);
  gravityForms($);
  ninjaForms($);
  wpForms($);
  wsForm($);
}
