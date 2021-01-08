export class Request {
  static modelName = 'request'
  static collectionName = 'request';
  static prefix = 'RQT';

  requestID: string; // Auto Gen

  // requester details
  requesterID: string;
  contactNumber: string;
  validationCode: string;

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
