export class Donor {
  static modelName = 'donor'
  static collectionName = 'donor';
  static prefix = 'DNR'
  firstName: string;
  lastName: string;
  fullName: string;
  mailingAddress: string;
  email: string;
  birthday: Date;
  sex: string;
  bloodType: string;
  donorPhotoUrl: string;

  isArchived: boolean;

  dateCreated: Date;
  dateLastModified: Date;
  createdBy: string;
  lastModifiedBy: string;
}
