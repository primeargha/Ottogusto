export interface IOeRefItem {
  oeRef: string;
  id: string;
  brand?: string;
  text: string;
  name: string;
  title: {
    [key: string]: string;
  };
}
