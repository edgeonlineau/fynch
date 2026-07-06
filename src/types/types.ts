export interface JQueryXhr {
  status: number;
}

export interface JQueryAjaxSettings {
  url: string;
  type: string;
  data: unknown;
}

export interface JQueryEvent {
  target: EventTarget | null;
  originalEvent?: Event;
}

export interface FluentFormsData {
  config?: { id?: string };
  response?: { data?: { entry_id?: string } };
}

export interface NinjaFormsResponse {
  id?: string;
  response?: {
    data?: {
      actions?: { save?: { entry_id?: string } };
      id?: string;
      settings?: { title?: string };
    };
  };
}
