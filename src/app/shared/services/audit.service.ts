import { Injectable } from '@angular/core';
import { FirebaseService} from './firebase.service';
import { Audit, Dispatch } from '../model';

@Injectable({
  providedIn: 'root'
})
export class AuditService {

  constructor( public firebase: FirebaseService) { }

  getInventoryLogs() {
    const filters = {
      value1: 'type',
      expression1: '==',
      value2: 'Inventory',
      value3: '',
      expression2: '',
      value4: '',
    };
    return this.firebase.getAllData(Audit, 1 , filters , 'date');
  }

  getDonorLogs() {
    const filters = {
      value1: 'type',
      expression1: '==',
      value2: 'Donor',
      value3: '',
      expression2: '',
      value4: '',
    };
    return this.firebase.getAllData(Audit, 1 , filters, 'date' );
  }

  getEventLogs() {
    const filters = {
      value1: 'type',
      expression1: '==',
      value2: 'Event',
      value3: '',
      expression2: '',
      value4: '',
    };
    return this.firebase.getAllData(Audit, 1 , filters , 'date');
  }

  getRequesterLogs() {
    const filters = {
      value1: 'type',
      expression1: '==',
      value2: 'Requester',
      value3: '',
      expression2: '',
      value4: '',
    };
    return this.firebase.getAllData(Audit, 1 , filters , 'date');
  }

  getRequestLogs() {
    const filters = {
      value1: 'type',
      expression1: '==',
      value2: 'Request',
      value3: '',
      expression2: '',
      value4: '',
    };
    return this.firebase.getAllData(Audit, 1 , filters , 'date');
  }

  getAccountLogs() {
    const filters = {
      value1: 'type',
      expression1: '==',
      value2: 'Account',
      value3: '',
      expression2: '',
      value4: '',
    };
    return this.firebase.getAllData(Audit, 1 , filters , 'date');
  }

  getDispatchLogs() {
    const filters = {
      value1: 'type',
      expression1: '==',
      value2: 'Dispatch',
      value3: '',
      expression2: '',
      value4: '',
    };
    return this.firebase.getAllData(Audit, 1 , filters , 'date');
  }

  getAuthenticationLogs() {
    const filters = {
      value1: 'type',
      expression1: '==',
      value2: 'Authentication',
      value3: '',
      expression2: '',
      value4: '',
    };
    return this.firebase.getAllData(Audit, 1 , filters , 'date');
  }

  getFeedbackReport() {
    const filters = {
      value1: 'isFeedback',
      expression1: '==',
      value2: true,
      value3: '',
      expression2: '',
      value4: '',
    };
    return this.firebase.getAllData(Dispatch, 1 , filters);
  }

  getFeedbackReportPartner(partnerID) {
    const filters = {
      value1: 'isFeedback',
      expression1: '==',
      value2: true,
      value3: 'searchTags',
      expression2: 'array-contains',
      value4: partnerID,
    };
    return this.firebase.getAllData(Dispatch, 2 , filters);
  }

  getInventoryLogsPartner(partnerID) {
    const filters = {
      value1: 'type',
      expression1: '==',
      value2: 'Inventory',
      value3: 'searchTags',
      expression2: 'array-contains',
      value4: partnerID,
    };
    return this.firebase.getAllData(Audit, 2 , filters);
  }

  getDispatchLogsPartner(partnerID) {
    const filters = {
      value1: 'type',
      expression1: '==',
      value2: 'Dispatch',
      value3: 'searchTags',
      expression2: 'array-contains',
      value4: partnerID,
    };
    return this.firebase.getAllData(Audit, 2 , filters);
  }
}
