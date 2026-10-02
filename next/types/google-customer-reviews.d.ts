export {};

declare global {
  interface Window {
    ___gcfg?: { lang: string };
    renderOptIn?: () => void;
    gapi?: {
      load: (api: string, callback: () => void) => void;
      surveyoptin: {
        render: (options: {
          merchant_id: number;
          order_id: string;
          email: string;
          delivery_country: string;
          estimated_delivery_date: string;
          opt_in_style?: string;
        }) => void;
      };
    };
  }
}
