export class User {
  static modelName = 'user';
  static collectionName = 'user';
  static prefix = 'USR';
  uid: any;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  contactNumber: number;
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

export class Sexes {
  static sexes = ['Male', 'Female']
}

export class Positions {
  static positions = ['System Admin', 'Event Manager', 'Blood Donor Manager', 'Dispatch & Request Manager']
}
