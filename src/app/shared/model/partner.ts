export class Partner {
  static modelName = 'partner'
  static collectionName = 'partner';
  static prefix = 'PTR';
  partnerID: string;
  institutionName: string;
  num: number;
  address: string;

  // Meta Data
  dateCreated: Date;
  dateLastModified: Date;
  createdBy: string;
  lastModifiedBy: string;
}
