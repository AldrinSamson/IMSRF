export class Partner {
  static collectionName = 'partner';
  static prefix = 'PN';
  partnerID: string;
  institutionName: string;

  // Meta Data
  num: number;
  dateCreated: Date;
  dateLastModified: Date;
  createdBy: string;
  lastModifiedBy: string;
}
