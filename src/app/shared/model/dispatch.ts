export class RequestDispatch {
  static modelName = 'requestBlood'
  static collectionName = 'requestBlood';
  static prefix = 'RQT';

  requestID: string; // Auto Gen

  // requester details
  firstName: string;
  lastName: string;
  fullName: string;
  mailingAddress: string;
  email: string;
  birthday: Date;
  sex: string;
  requesterPhotoUrl: string;

  // requests details
  patientName: string;
  hospitalName: string;
  patientDiagnosis: string;
  patientBloodType: string;
  patientBloodComponent: string;
  patientBloodUnits: number;
  patientDiagnosisPhotoUrl: string;

  dateRequested: Date;
  status: string; // Requested, Dispatch Created

  isOrdered: boolean;
  isArchived: boolean;
  num: number;

  dateCreated: Date;
  dateLastModified: Date;
  createdBy: string;
  lastModifiedBy: string;
}

export class OrderDispatch {
  static modelName = 'dispatchBlood'
  static collectionName = 'dispatchBlood';
  static prefix = 'DSP';

  // order details
  dispatchID: string; // Auto Generated
  requestID: string;
  partnerID: string;
  institutionName: string;
  requesterName: string;
  patientName: string;
  bloodType: string;

  // selected items [{batchID , quantity}]
  orderItems: JSON;
  status: string; // Active, Delivered?, Claimed

  claimCode: string;
  dateOrderCreated: Date;
  dateClaimed: Date;

  // Meta Data
  isCompleted: boolean;
  isArchived: boolean;

  dateCreated: Date;
  dateLastModified: Date;
  createdBy: string;
  lastModifiedBy: string;

  // [DSP , RQT , PTR ]
  // experimental for use in advanced searches using array-contains-any
  searchTags: Array<any>;
}
