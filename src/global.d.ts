interface DataLayerEvent {
  event: string;
  action: string;
  specifics: string;
}

interface Window {
  dataLayer: DataLayerEvent[];
}

declare const dataLayer: DataLayerEvent[];

interface JQueryStatic {
  (selector: string | Document | Element): JQuery;
}

interface JQuery {
  on(event: string, handler: (...args: any[]) => void): JQuery;
  find(selector: string): JQuery;
  text(): string;
  length: number;
}

declare const jQuery: JQueryStatic | undefined;

interface DmAPI {
  EVENTS: { FORM_SUBMISSION: string };
  subscribeEvent(event: string, callback: () => void): void;
}

declare const dmAPI: DmAPI | undefined;

interface HsForm {
  getFormId(): string;
}

interface HubspotFormsV4Interface {
  getFormFromEvent(event: Event): HsForm | null;
}

declare const HubspotFormsV4: HubspotFormsV4Interface;
