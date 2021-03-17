import { Injectable } from '@angular/core';
import { FirebaseService  } from './firebase.service';
import { IdGeneratorService } from './id-generator.service';
import { AuthService } from './auth.service';
import { Request, Dispatch, Inventory, PartnerRequest } from '../model';
import { AngularFirestore } from '@angular/fire/firestore';
import { AlertService } from './alert.service';
import { InventoryService } from './inventory.service';
import { EMPTY } from 'rxjs';
import { ParseError } from '@angular/compiler';

// Service for all Orders and Requests including Pending requests from requester
@Injectable({
  providedIn: 'root'
})
export class DispatchService {

  constructor(
    public firebase: FirebaseService,
    public db: AngularFirestore,
    public authService: AuthService,
    public genService: IdGeneratorService,
    public alertService: AlertService,
    private readonly inventoryService: InventoryService) {

  }

  getAllRequest(){
    return this.firebase.getAllData<Request>(Request);
  }

  getOneRequest(id){
    return this.firebase.getOne<Request>(Request , id);
  }

  getAllOrder(){
    return this.firebase.getAllData<Dispatch>(Dispatch);
  }

  getOneOrder(id){
    return this.firebase.getOne<Dispatch>(Dispatch , id);
  }

  getForApprovalRequests() {
    const filters = {
      value1: 'status',
      expression1: '==',
      value2: 'For Approval',
      value3: 'isApproved',
      expression2: '==',
      value4: false,
    };
    return this.firebase.getAllData(Request, 2 , filters);
  }

  getApprovedRequests() {
    const filters = {
      value1: 'isApproved',
      expression1: '==',
      value2: true,
      value3: '',
      expression2: '',
      value4: '',
    };
    return this.firebase.getAllData(Request, 1 , filters);
  }

  getDeniedRequests() {
    const filters = {
      value1: 'status',
      expression1: '==',
      value2: 'Denied',
      value3: 'isApproved',
      expression2: '==',
      value4: false,
    };
    return this.firebase.getAllData(Request, 2 , filters);
  }

  getArchivedRequests() {
    const filters = {
      value1: 'isArchived',
      expression1: '==',
      value2: true,
      value3: '',
      expression2: '',
      value4: '',
    };
    return this.firebase.getAllData(Request, 1 , filters);
  }

  getPartnerRequest(partnerID) {
    const filters = {
      value1: 'partnerID',
      expression1: '==',
      value2: partnerID,
      value3: '',
      expression2: '',
      value4: '',
    };
    return this.firebase.getAllData(PartnerRequest, 1 , filters);
  }

  getAllActivePartnerRequest() {
    const filters = {
      value1: 'isCompleted',
      expression1: '==',
      value2: false,
      value3: 'isArchived',
      expression2: '==',
      value4: false,
    };
    return this.firebase.getAllData(PartnerRequest, 0 , filters);
  }

  getActiveOrder() {
    const filters = {
      value1: 'status',
      expression1: 'in',
      value2: ['Active', 'Delivered'],
      value3: '',
      expression2: '',
      value4: '',
    };
    return this.firebase.getAllData(Dispatch, 1 , filters);
  }

  getClaimed() {
    const filters = {
      value1: 'status',
      expression1: '==',
      value2: 'Claimed',
      value3: 'isArchived',
      expression2: '==',
      value4: false,
    };
    return this.firebase.getAllData(Dispatch, 2 , filters);
  }

  getArchivedClaimed() {
    const filters = {
      value1: 'status',
      expression1: '==',
      value2: 'Claimed',
      value3: 'isArchived',
      expression2: '==',
      value4: true,
    };
    return this.firebase.getAllData(Dispatch, 2 , filters);
  }

  getOrdersOfPartner(partnerID) {
    const filters = {
      value1: 'status',
      expression1: 'in',
      value2: ['Active', 'Delivered'],
      value3: 'partnerID',
      expression2: '==',
      value4: partnerID,
    };
    return this.firebase.getAllData(Dispatch, 2 , filters);
  }

  createRequest(values) {
    this.genService.generateID(Request).then(val => {
      this.db.collection<Request>(Request.collectionName).add({

      requestID: val.newID,
      requesterID: values.requesterID,
      fullName: values.fullName,
      dateRequested: new Date(),
      status: 'Approved',
      isOrdered: false,
      isApproved: true,
      isArchived: false,
      num: val.newNum,

      patientName: values.patientName,
      hospitalName: values.hospitalName,
      patientDiagnosis: values.patientDiagnosis,
      patientBloodType: values.patientBloodType,
      patientBloodComponent: values.patientBloodComponent,
      patientBloodUnits: values.patientBloodUnits,
      patientDiagnosisPhotoUrl: values.patientDiagnosisPhotoUrl,

      dateCreated: new Date(),
      dateLastModified: new Date(),
      createdBy: this.authService.userName(),
      lastModifiedBy: this.authService.userName()
    })
    this.firebase.audit('Request' , 'Created Request for ' + values.fullName, val.newID);
    }).catch(error => {
      throw new Error('Error: Adding document:' + error);
    }).then( () => {
      this.alertService.showToaster(values.requestID+' Request Added' , { classname: 'bg-success text-light', delay: 10000 })
    })

  }

  createOrder(values) {
    const createdClaimCode = this.genService.claimCodeRNG();
    this.genService.generateID(Dispatch , values).then(val => {
      this.db.collection<Dispatch>(Dispatch.collectionName).add({
      dispatchID: val.newID,
      requestID: values.requestID,
      requesterID: values.requesterID,
      partnerID: values.partnerID,
      requesterName: values.requesterName,
      institutionName: values.institutionName,
      patientName: values.patientName,
      bloodType: values.bloodType,

      orderItems: values.orderItems,
      status: 'Active',
      dateOrderCreated: new Date(),
      dateClaimed: null,
      claimCode: createdClaimCode,
      feedback: 'N/A',

      searchTags: [val.newID, values.requestID, values.partnerID],
      isCompleted: false,
      isArchived: false,
      isFeedback: false,
      dateCreated: new Date(),
      dateLastModified: new Date(),
      createdBy: this.authService.userName(),
      lastModifiedBy: this.authService.userName()
    })
      this.firebase.audit('Dispatch' , 'Dispatch Created ' + val.newID, val.newID);
    }).catch(error => {
      throw new Error('Error: Adding document:' + error);
    }).then( () => {
      this.db.collection<Request>(Request.collectionName).doc(values.id).update({
        status: 'Dispatch Created',
        isOrdered: true,
        dateLastModified: new Date(),
        lastModifiedBy: this.authService.userName()
      }).catch(error => {
        throw new Error('Error: Updating document:' + error);
      }).then( () => {
        this.firebase.audit('Request' , 'Dispatch Created for ' + values.requestID, values.requestID);
        this.alertService.showToaster(values.requestID+' Modified' , { classname: 'bg-success text-light', delay: 10000 })
      });
      this.alertService.showToaster(values.requestID+' Dispatch Added' , { classname: 'bg-success text-light', delay: 10000 })
    })
  }

  updateRequest(id , values) {
    this.db.collection<Request>(Request.collectionName).doc(id).update({
      requesterID: values.requesterID,
      patientName: values.patientName,
      hospitalName: values.hospitalName,
      patientDiagnosis: values.patientDiagnosis,
      patientBloodType: values.patientBloodType,
      patientBloodComponent: values.patientBloodComponent,
      patientBloodUnits: values.patientBloodUnits,

      dateLastModified: new Date(),
      lastModifiedBy: this.authService.userName()
    }).catch(error => {
      throw new Error('Error: Updating document:' + error);
    }).then( () => {
      this.firebase.audit('Request' , 'Created Request for ' + values.fullName, values.requestID);
      this.alertService.showToaster(values.requestID+' Modified' , { classname: 'bg-success text-light', delay: 10000 })
    });
  }

  approveRequest(id, values) {
    this.db.collection<Request>(Request.collectionName).doc(id).update({
      status: 'Approved',
      isApproved: true,

      dateLastModified: new Date(),
      lastModifiedBy: this.authService.userName()
    }).catch(error => {
      throw new Error('Error: Updating document:' + error);
    }).then( () => {
      this.firebase.audit('Request' , 'Approved Request for ' + values.fullName, values.requestID);
      this.alertService.showToaster(id+' Modified' , { classname: 'bg-success text-light', delay: 10000 })
    });
  }

  denyRequest(id, values) {
    this.db.collection<Request>(Request.collectionName).doc(id).update({
      status: 'Denied',
      isApproved: false,

      dateLastModified: new Date(),
      lastModifiedBy: this.authService.userName()
    }).catch(error => {
      throw new Error('Error: Updating document:' + error);
    }).then( () => {
      this.firebase.audit('Request' , 'Denied Request for ' + values.fullName, values.requestID);
      this.alertService.showToaster(id+' Modified' , { classname: 'bg-success text-light', delay: 10000 })
    });
  }

  updateOrder(id , values) {
    this.db.collection<Dispatch>(Dispatch.collectionName).doc(id).update({
      dispatchID: values.dispatchID,
      requestID: values.requestID,
      partnerID: values.partnerID,
      institutionName: values.institutionName,
      orderItems: values.orderItems,

      searchTags: [values.dispatchID, values.requestID, values.partnerID],
      dateLastModified: new Date(),
      lastModifiedBy: this.authService.userName()
    }).catch(error => {
      throw new Error('Error: Updating document:' + error);
    }).then( () => {
      this.firebase.audit('Dispatch' , 'Modified ' + values.dispatchID, values.dispatchID);
      this.alertService.showToaster(values.dispatchID+' Modified' , { classname: 'bg-success text-light', delay: 10000 })
    });
  }

  deliverOrder(id , dispatchID) {
    return this.db.collection(Dispatch.collectionName).doc(id).update({status: 'Delivered',
    dateLastModified: new Date(), lastModifiedBy: this.authService.userName()})
    .then((res) => {
      this.firebase.audit('Dispatch' , 'Delivered ' + dispatchID, dispatchID);
      this.alertService.showToaster(dispatchID+ 'Delivered', { classname: 'bg-success text-light', delay: 10000 });
    })
    .catch((_error) => {
      console.log('' + Dispatch.collectionName + ' Delete Failed!', _error);
    });
  }

  claimOrder(id, values) {
    this.genService.claimCodeCheck(Dispatch, id, values.claimCodeEntered).then(val => {
      if(val === true) {
        // tslint:disable-next-line: prefer-const
        let i = 0;
        while (i < values.orderItems.length ) {
          const orderItem = values.orderItems[i]

          this.inventoryService.getAndSubtract(orderItem.id, orderItem.quantity).then(vals => {
            if (vals === EMPTY) {
              this.alertService.showToaster(orderItem.batchID+ ' Invalid Quantity',
              { classname: 'bg-success text-light', delay: 10000 });
            } else {
              this.firebase.audit('Inventory' , 'Claimed ' + orderItem.batchID, orderItem.batchID);
              orderItem.quantity = vals;
              if (orderItem.quantity === 0) {
                orderItem.isEmpty = true;
              }
              this.inventoryService.updateOne(orderItem.id ,orderItem);
            }
          })
          i++;
        }
      } else {
        this.alertService.showToaster(values.dispatchID+' Invalid Claim Code' , { classname: 'bg-success text-light', delay: 10000 })
      }
    }).catch(error => {
      throw new Error('Error: Checking Code:' + error);
    })
    .finally( ()=> {
      this.db.collection(Dispatch.collectionName).doc(id).update({

        status: 'Claimed',
        isCompleted: true,
        dateClaimed: new Date(),
        dateLastModified: new Date(),
        lastModifiedBy: this.authService.userName()

      }).then((res) => {
        this.firebase.audit('Dispatch' , 'Claimed ' + values.dispatchID, values.dispatchID);
        this.alertService.showToaster(values.dispatchID+ ' Claimed', { classname: 'bg-success text-light', delay: 10000 });
      })
      .catch((_error) => {
        console.log('' + Dispatch.collectionName + ' Delete Failed!', _error);
      });
    })
  }

  createPartnerRequest(values) {
    this.genService.generateID(PartnerRequest).then(val => {
      this.db.collection<PartnerRequest>(PartnerRequest.collectionName).add({
      partnerRequestID: val.newID,
      partnerID: values.partnerID,
      institutionName: values.institutionName,

      orderItems: values.orderItems,
      status: 'Active',
      dateOrderCreated: new Date(),

      searchTags: [val.newID, values.partnerID],
      isCompleted: false,
      isArchived: false,
      dateCreated: new Date(),
      dateLastModified: new Date(),
      createdBy: this.authService.userName(),
      lastModifiedBy: this.authService.userName()
    })
      this.firebase.audit('Partner Request' , 'Partner Request Created ' + val.newID, val.newID);
    }).catch(error => {
      throw new Error('Error: Adding document:' + error);
    })
  }

  updatePartnerRequest(id , values) {
    this.db.collection<PartnerRequest>(PartnerRequest.collectionName).doc(id).update({
      partnerRequestID: values.partnerRequestID,
      partnerID: values.partnerID,
      institutionName: values.institutionName,
      orderItems: values.orderItems,

      searchTags: [values.partnerRequestID, values.partnerID],
      dateLastModified: new Date(),
      lastModifiedBy: this.authService.userName()
    }).catch(error => {
      throw new Error('Error: Updating document:' + error);
    }).then( () => {
      this.firebase.audit('Partner Request' , 'Modified ' + values.partnerRequestID, values.partnerRequestID);
      this.alertService.showToaster(values.partnerRequestID+' Modified' , { classname: 'bg-success text-light', delay: 10000 })
    });
  }

  releasePartnerRequest(id, values) {
    this.db.collection<PartnerRequest>(PartnerRequest.collectionName).doc(id).update({

      status: 'Released',
      isCompleted: true,
      dateClaimed: new Date(),
      dateLastModified: new Date(),
      lastModifiedBy: this.authService.userName()

    }).then((res) => {
      let i = 0;
      while (i < values.orderItems.length ) {
        const orderItem = values.orderItems[i]

        this.inventoryService.getAndSubtract(orderItem.id, orderItem.quantity).then(vals => {
          if (vals === EMPTY) {
            this.alertService.showToaster(orderItem.batchID+ ' Invalid Quantity',
            { classname: 'bg-success text-light', delay: 10000 });
          } else {
            this.firebase.audit('Inventory' , 'Claimed ' + orderItem.batchID, orderItem.batchID);
            orderItem.quantity = vals;
            if (orderItem.quantity === 0) {
              orderItem.isEmpty = true;
            }
            this.inventoryService.updateOne(orderItem.id ,orderItem);
          }
        })
        i++;
      }
      this.firebase.audit('Partner Request' , 'Released ' + values.partnerRequestID, values.partnerRequestID);
      this.alertService.showToaster(values.partnerRequestID+ ' Released', { classname: 'bg-success text-light', delay: 10000 });
    })
    .catch((_error) => {
      console.log('' + PartnerRequest.collectionName + ' Update Failed!', _error);
    });
  }

  denyPartnerRequest(id, values) {
    this.db.collection<PartnerRequest>(PartnerRequest.collectionName).doc(id).update({
      status: 'Denied',

      dateLastModified: new Date(),
      lastModifiedBy: this.authService.userName()
    }).catch(error => {
      throw new Error('Error: Updating document:' + error);
    }).then( () => {
      this.firebase.audit('Partner Request' , 'Denied Partner Request for ' + values.institutionName, values.partnerRequestID);
      this.alertService.showToaster(id+' Modified' , { classname: 'bg-success text-light', delay: 10000 })
    });
  }

  archiveRequest(id, values) {
    this.firebase.audit('Request' , 'Archived Request for ' + values.fullName, values.requestID);
    return this.firebase.archiveOne(Request, id);
  }

  restoreRequest(id, values){
    this.firebase.audit('Request' , 'Restored Request for ' + values.fullName, values.requestID);
    return this.firebase.restoreOne(Request, id);
  }

  deleteRequest(id, values) {
    this.firebase.audit('Request' , 'Deleted Request for ' + values.fullName, values.requestID);
    return this.firebase.deleteOne(Request, id);
  }

  archiveOrder(id, values) {
    this.firebase.audit('Dispatch' , 'Archived ' + values.dispatchID, values.dispatchID);
    return this.firebase.archiveOne(Dispatch, id);
  }

  restoreOrder(id, values){
    this.firebase.audit('Dispatch' , 'Restored ' + values.dispatchID, values.dispatchID);
    return this.firebase.restoreOne(Dispatch, id);
  }

  deleteOrder(id, values) {
    this.firebase.audit('Dispatch' , 'Deleted ' + values.dispatchID, values.dispatchID);
    return this.firebase.deleteOne(Dispatch, id);
  }

  deletePartnerRequest(id, values) {
    this.firebase.audit('Partner Request' , 'Deleted ' + values.partnerRequestID, values.partnerRequestID);
    return this.firebase.deleteOne(PartnerRequest, id);
  }
}
