export class Inventory {
  static modelName = 'inventory';
  static collectionName = 'inventory';
  static prefix = 'BCH';
  batchID: string; // Auto-generated
  partnerID: string;
  eventID: string;
  institutionName: string;

  bloodType: string;
  bloodTypeCode: string;
  quantity: number;
  dateExpiry: Date;

  // Meta Data
  isExpired: boolean;
  isEmpty: boolean;
  isArchived: boolean;

  dateCreated: Date;
  dateLastModified: Date;
  createdBy: string;
  lastModifiedBy: string;

  // [BCH , EVT , PTR , DATE of EXPIRY, bloodType ]
  // experimental for use in advanced searches using array-contains-any
  searchTags: Array<any>;
}

export class BloodTypes {
  static bloodTypes = ['A+' , 'A-' , 'B+' , 'B-' , 'O+' , 'O-' , 'AB+' , 'AB-'];
  static bloodTypeCode = ['AP' , 'AN' , 'BP' , 'BN' , 'OP' , 'ON' , 'ABP' , 'ABN'];
}
