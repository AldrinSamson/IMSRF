export class Audit {
  static collectionName = 'audit';
  static modelName = 'audit';

  action: string;
  date: Date;
  level: string;
  name: string;
  type: string;
  associatedID : string;
  uid: string;
}
