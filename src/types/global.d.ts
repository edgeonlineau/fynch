interface DataLayerEvent {
  event: string;
  action: string;
  page_url: string;
  page_title: string;
  page_path: string;
  referrer: string;
  timestamp: string;
  service_provider?: string;
  form_id?: string;
  form_name?: string;
  lead_id?: string;
  link_url?: string;
  link_text?: string;
  link_id?: string;
  link_classes?: string;
  link_domain?: string;
  map_provider?: string;
  messaging_channel?: string;
  app_store?: string;
  calendar_provider?: string;
  file_name?: string;
  file_extension?: string;
  percent_scrolled?: number;
}

interface Window {
  dataLayer: DataLayerEvent[];
}

declare const dataLayer: DataLayerEvent[];

interface JQueryStatic {
  (selector: string | Document | Element): JQuery;
}

interface JQuery {
  on(event: string, handler: (...args: unknown[]) => void): JQuery;
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

declare const HubspotFormsV4: HubspotFormsV4Interface | undefined;

interface BeaconAPI {
  (method: string, event: string, callback: () => void): void;
}

interface TawkAPI {
  onChatStarted?: () => void;
}

interface CrmForm {
  callback?: (leadId: string) => void;
}

type PodiumEventsCallback = (event: string, properties: Record<string, string>) => void;

interface Window {
  Beacon?: BeaconAPI;
  Tawk_API?: TawkAPI;
  crmForm?: CrmForm;
  PodiumEventsCallback?: PodiumEventsCallback;
}
