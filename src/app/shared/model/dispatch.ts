export class Dispatch {
  static modelName = 'dispatch'
  static collectionName = 'dispatch';
  static prefix = 'DSP';

  // order details
  dispatchID: string; // Auto Generated
  requestID: string;
  requesterID: string;
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
  feedback: string;

  // Meta Data
  isCompleted: boolean;
  isArchived: boolean;
  isFeedback: boolean;

  dateCreated: Date;
  dateLastModified: Date;
  createdBy: string;
  lastModifiedBy: string;

  // [DSP , RQT , PTR , RQR ]
  // experimental for use in advanced searches using array-contains-any
  searchTags: Array<any>;
}
