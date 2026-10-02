export interface KeyValueArrayInterface {
  [key: string]: string;
}
export interface OGCat_NodeProps {
  id: string;
  parentId: string;
  name: string;
  displayOrder: string;
  titles: KeyValueArrayInterface[];
  children?: string;
}
