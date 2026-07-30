___INFO___

{
  "type": "TAG",
  "id": "cvt_temp_public_id",
  "version": 1,
  "securityGroups": [],
  "displayName": "Fynch Event Tracking",
  "categories": [
    "ANALYTICS",
    "CONVERSIONS"
  ],
  "brand": {
    "id": "brand_dummy",
    "displayName": "Edge Online"
  },
  "description": "Loads Fynch, a zero-config client-side event tracker. Fynch attaches its own listeners on load and pushes form, click, scroll, chat, and booking events to the dataLayer under event names of the form fynch.<action> (e.g. fynch.form_lead), with the event details under a fynch object. No configuration required — fire this tag once on Initialization / All Pages.",
  "containerContexts": [
    "WEB"
  ]
}


___TEMPLATE_PARAMETERS___

[
  {
    "type": "LABEL",
    "name": "introLabel",
    "displayName": "This tag loads the Fynch script from a public CDN. Fynch self-initialises on load and pushes events to the dataLayer under event names of the form \"fynch.<action>\" (e.g. \"fynch.form_lead\"). Trigger this tag once per page (Initialization - All Pages is recommended)."
  },
  {
    "type": "RADIO",
    "name": "versionMode",
    "displayName": "Version",
    "radioItems": [
      {
        "value": "latest",
        "displayValue": "Use the version bundled with this template (recommended)"
      },
      {
        "value": "pin",
        "displayValue": "Pin a specific version"
      }
    ],
    "simpleValueType": true,
    "defaultValue": "latest",
    "help": "“Use the version bundled with this template” is fixed to the newest Fynch release at the time this template version was published. It does not change on its own — to move to a newer Fynch, update this template to its latest version. Choose “Pin a specific version” to lock to an exact release regardless of template updates."
  },
  {
    "type": "TEXT",
    "name": "pinnedVersion",
    "displayName": "Version",
    "simpleValueType": true,
    "valueHint": "0.1.2",
    "enablingConditions": [
      {
        "paramName": "versionMode",
        "paramValue": "pin",
        "type": "EQUALS"
      }
    ],
    "valueValidators": [
      {
        "type": "NON_EMPTY"
      },
      {
        "type": "REGEX",
        "args": [
          "^\\d+\\.\\d+\\.\\d+(?:-[0-9A-Za-z.-]+)?$"
        ],
        "errorMessage": "Enter an exact version such as 0.1.2 (no \"v\" prefix, no range)."
      }
    ],
    "help": "The exact npm version of @edgeonline/fynch to load, e.g. 0.1.2."
  },
  {
    "type": "SELECT",
    "name": "cdn",
    "displayName": "CDN",
    "macrosInSelect": false,
    "selectItems": [
      {
        "value": "jsdelivr",
        "displayValue": "jsDelivr (cdn.jsdelivr.net)"
      },
      {
        "value": "unpkg",
        "displayValue": "unpkg (unpkg.com)"
      }
    ],
    "simpleValueType": true,
    "defaultValue": "jsdelivr"
  }
]


___SANDBOXED_JS_FOR_WEB_TEMPLATE___

const injectScript = require('injectScript');

// The most recent Fynch release at the time this template version was
// published. "Use the version bundled with this template" resolves to this
// constant, so the loaded version never changes on its own: pulling in a
// newer Fynch means updating and re-publishing this template. Users who need
// a different release pin it explicitly via the Version field.
const LATEST_VERSION = '0.1.2';

const version = data.versionMode === 'pin' ? data.pinnedVersion : LATEST_VERSION;

const cdnBase =
  data.cdn === 'unpkg'
    ? 'https://unpkg.com/@edgeonline/fynch@'
    : 'https://cdn.jsdelivr.net/npm/@edgeonline/fynch@';

const url = cdnBase + version + '/dist/fynch.js';

// Fynch attaches its own listeners and creates window.dataLayer if missing,
// so there is nothing to configure or call after load. The URL doubles as the
// injectScript cache token so the script is only fetched once even if the tag
// somehow fires again.
injectScript(url, data.gtmOnSuccess, data.gtmOnFailure, url);


___WEB_PERMISSIONS___

[
  {
    "instance": {
      "key": {
        "publicId": "inject_script",
        "versionId": "1"
      },
      "param": [
        {
          "key": "urls",
          "value": {
            "type": 2,
            "listItem": [
              {
                "type": 1,
                "string": "https://cdn.jsdelivr.net/npm/@edgeonline/fynch@*"
              },
              {
                "type": 1,
                "string": "https://unpkg.com/@edgeonline/fynch@*"
              }
            ]
          }
        }
      ]
    },
    "clientAnnotations": {
      "isEditedByUser": true
    },
    "isRequired": true
  }
]


___TESTS___

scenarios:
- name: Defaults to the bundled latest version on jsDelivr
  code: |-
    const mockData = {
      versionMode: 'latest',
      cdn: 'jsdelivr',
    };

    let capturedUrl;
    let capturedCacheToken;
    mock('injectScript', function (url, onSuccess, onFailure, cacheToken) {
      capturedUrl = url;
      capturedCacheToken = cacheToken;
      onSuccess();
    });

    runCode(mockData);

    assertThat(capturedUrl).isEqualTo(
      'https://cdn.jsdelivr.net/npm/@edgeonline/fynch@0.1.2/dist/fynch.js'
    );
    assertThat(capturedCacheToken).isEqualTo(capturedUrl);
    assertApi('gtmOnSuccess').wasCalled();
- name: Pins the requested version
  code: |-
    const mockData = {
      versionMode: 'pin',
      pinnedVersion: '0.1.0',
      cdn: 'jsdelivr',
    };

    let capturedUrl;
    mock('injectScript', function (url, onSuccess) {
      capturedUrl = url;
      onSuccess();
    });

    runCode(mockData);

    assertThat(capturedUrl).isEqualTo(
      'https://cdn.jsdelivr.net/npm/@edgeonline/fynch@0.1.0/dist/fynch.js'
    );
- name: Builds an unpkg URL when selected
  code: |-
    const mockData = {
      versionMode: 'latest',
      cdn: 'unpkg',
    };

    let capturedUrl;
    mock('injectScript', function (url, onSuccess) {
      capturedUrl = url;
      onSuccess();
    });

    runCode(mockData);

    assertThat(capturedUrl).isEqualTo(
      'https://unpkg.com/@edgeonline/fynch@0.1.2/dist/fynch.js'
    );
- name: Reports failure when the script cannot load
  code: |-
    const mockData = {
      versionMode: 'latest',
      cdn: 'jsdelivr',
    };

    mock('injectScript', function (url, onSuccess, onFailure) {
      onFailure();
    });

    runCode(mockData);

    assertApi('gtmOnFailure').wasCalled();


___NOTES___

Custom Tag template for loading Fynch (@edgeonline/fynch) via a CDN.

Publishing checklist when a new Fynch version ships:
1. Update LATEST_VERSION in the sandboxed code to the new release.
2. Bump "version" in the ___INFO___ block.
3. Re-run the template tests (the default-version test asserts LATEST_VERSION).
4. Re-publish the template / open a PR to the Community Template Gallery.

Note: GTM's injectScript API cannot set a Subresource Integrity (SRI) hash.
If SRI is required, use the Custom HTML snippet from the main README instead.
