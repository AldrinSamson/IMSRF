export class User {
  static collectionName = 'user';
  static prefix = 'UR';
  uid: any;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  contactNumber: string;
  photoUrl: string;
  position: string;
  institutionName: string; // default Red Bank Foundation

  // Partner Only;
  partnerID: string;

  // Meta Data
  dateCreated: Date;
  dateLastModified: Date;
  createdBy: string;
  lastModifiedBy: string;
}
