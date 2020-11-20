export class Event {
  static modelName = 'event'
  static collectionName = 'event';
  static prefix = 'EVT';

  // Pre-Event
  eventID: string; // Auto generated
  partnerID: string;
  institutionName: string;
  dateOfEvent: Date;
  dateOfEventShort: string;
  location: string;

  // Post-Event
  dateSubmitted: Date;
  donorsRegistered: number;
  donorsDefferTotal: number;
  donorsDefferScreen: number; // Donors Screened
  donorsDefferLow: number; // Low Hemoglobin
  donorsBledTotal: number;
  donorsBledOk: number; // Success Phlebotomy
  donorsBledFail: number; // Unsuccessful Phlebotomy

  dateExpiry: Date;
  quantityAP: number;
  quantityAN: number;
  quantityBP: number;
  quantityBN: number;
  quantityOP: number;
  quantityON: number;
  quantityABP: number;
  quantityABN: number;
  quantityTotal: number; // Auto Computed
  batchIDIndex: Array<any>;
  remarks: string;

  // Meta Data
  isSubmitted: boolean;
  isCataloged: boolean;
  isArchived: boolean;

  dateCreated: Date;
  dateLastModified: Date;
  createdBy: string;
  lastModifiedBy: string;

  // [ EVT , PTR , DATE of EVENT ]
  // experimental for use in advanced searches using array-contains-any
  searchTags: Array<any>;
}
