export class Requester {
  static modelName = 'requester'
  static collectionName = 'requester';
  static prefix = 'RQR';

  uid: string;
  requesterID: string;
  contactNumber: string; // only changeable in internal

  // requester details
  firstName: string;
  lastName: string;
  fullName: string;
  mailingAddress: string;
  email: string;
  birthday: Date;
  sex: string;
  requesterPhotoUrl: string;

  isActive: boolean;
  num: number;

  dateCreated: Date;
  dateLastModified: Date;
  createdBy: string;
  lastModifiedBy: string;
}


