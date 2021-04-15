export class Request {
  static modelName = 'request'
  static collectionName = 'request';
  static prefix = 'RQT';

  requestID: string; // Auto Gen

  // requester details
  requesterID: string;
  fullName: string;

  // requests details
  patientName: string;
  hospitalName: string;
  patientDiagnosis: string;
  patientBloodType: string;
  patientBloodComponent: string;
  patientBloodUnits: number;
  patientDiagnosisPhotoUrl: string;

  dateRequested: Date;
  status: string; // Dispatch Created, Approved, Denied, For Approval

  isOrdered: boolean;
  isApproved: boolean;
  isArchived: boolean;
  num: number;

  dateCreated: Date;
  dateLastModified: Date;
  createdBy: string;
  lastModifiedBy: string;
}

export class PartnerRequest {
  static modelName = 'requestPartner'
  static collectionName = 'requestPartner';
  static prefix = 'RQP';

  // order details
  partnerRequestID: string;
  partnerID: string;
  institutionName: string;

  // selected items [{batchID , quantity}]
  orderItems: JSON;
  status: string; // Active, Denied, Released

  dateOrderCreated: Date;

  // Meta Data
  isCompleted: boolean;
  isArchived: boolean;

  dateCreated: Date;
  dateLastModified: Date;
  createdBy: string;
  lastModifiedBy: string;
  num: number;

  // [RQP , PTR  ]
  // experimental for use in advanced searches using array-contains-any
  searchTags: Array<any>;
}
