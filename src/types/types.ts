export interface JQueryXhr {
  status: number;
}

export interface JQueryAjaxSettings {
  url: string;
  type: string;
  data: string;
}

export interface JQueryEvent {
  target: EventTarget | null;
  originalEvent?: Event;
}

export interface FluentFormsData {
  config?: { id?: string };
}

export interface NinjaFormsResponse {
  id?: string;
}
