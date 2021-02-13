import { Injectable } from '@angular/core';
import { FirebaseService  } from './firebase.service';
import { IdGeneratorService } from './id-generator.service';
import { AuthService } from './auth.service';
import { RequestDispatch, OrderDispatch, Inventory } from '../model';
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
    return this.firebase.getAllData<RequestDispatch>(RequestDispatch);
  }
  getOneRequest(id){
    return this.firebase.getOne<RequestDispatch>(RequestDispatch , id);
  }

  getAllOrder(){
    return this.firebase.getAllData<OrderDispatch>(OrderDispatch);
  }
  getOneOrder(id){
    return this.firebase.getOne<OrderDispatch>(OrderDispatch , id);
  }

  getActiveRequests() {
    const filters = {
      value1: 'status',
      expression1: '==',
      value2: 'Requested',
      value3: '',
      expression2: '',
      value4: '',
    };
    return this.firebase.getAllData(RequestDispatch, 1 , filters);
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
    return this.firebase.getAllData(OrderDispatch, 1 , filters);
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
    return this.firebase.getAllData(OrderDispatch, 2 , filters);
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
    return this.firebase.getAllData(OrderDispatch, 2 , filters);
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
    return this.firebase.getAllData(OrderDispatch, 2 , filters);
  }

  createRequest(values) {
    this.genService.generateID(RequestDispatch).then(val => {
      this.db.collection<RequestDispatch>(RequestDispatch.collectionName).add({

      requestID: val.newID,
      dateRequested: new Date(),
      status: 'Requested',
      isOrdered: false,
      isArchived: false,
      num: val.newNum,

      firstName: values.firstName,
      lastName: values.lastName,
      fullName: values.fullName,
      mailingAddress: values.mailingAddress,
      email: values.email,
      birthday: values.birthday,
      sex: values.sex,
      requesterPhotoUrl: values.requesterPhotoUrl,
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
    })}).catch(error => {
      throw new Error('Error: Adding document:' + error);
    }).then( () => {
      this.alertService.showToaster(values.fullName+' Request Added' , { classname: 'bg-success text-light', delay: 10000 })
    })

  }

  createOrder(values) {
    const createdClaimCode = this.genService.claimCodeRNG();
    this.genService.generateID(OrderDispatch , values).then(val => {
      this.db.collection<OrderDispatch>(OrderDispatch.collectionName).add({
      dispatchID: val.newID,
      requestID: values.requestID,
      partnerID: values.partnerID,
      institutionName: values.institutionName,
      requesterName: values.requesterName,
      patientName: values.patientName,
      bloodType: values.bloodType,

      orderItems: values.orderItems,
      status: 'Active',
      dateOrderCreated: new Date(),
      dateClaimed: null,
      claimCode: createdClaimCode,

      searchTags: [val.newID, values.requestID, values.partnerID],
      isCompleted: false,
      isArchived: false,
      dateCreated: new Date(),
      dateLastModified: new Date(),
      createdBy: this.authService.userName(),
      lastModifiedBy: this.authService.userName()
    })}).catch(error => {
      throw new Error('Error: Adding document:' + error);
    }).then( () => {
      this.db.collection<RequestDispatch>(RequestDispatch.collectionName).doc(values.id).update({
        status: 'Dispatch Created',
        isOrdered: true,
        dateLastModified: new Date(),
        lastModifiedBy: this.authService.userName()
      }).catch(error => {
        throw new Error('Error: Updating document:' + error);
      }).then( () => {
        this.alertService.showToaster(values.requestID+' Modified' , { classname: 'bg-success text-light', delay: 10000 })
      });
      this.alertService.showToaster(values.requestID+' Dispatch Added' , { classname: 'bg-success text-light', delay: 10000 })
    })
  }

  updateRequest(id , values) {
    this.db.collection<RequestDispatch>(RequestDispatch.collectionName).doc(id).update({
      firstName: values.firstName,
      lastName: values.lastName,
      fullName: values.fullName,
      mailingAddress: values.mailingAddress,
      email: values.email,
      birthday: values.birthday,
      sex: values.sex,
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
      this.alertService.showToaster(values.requestID+' Modified' , { classname: 'bg-success text-light', delay: 10000 })
    });
  }

  updateOrder(id , values) {
    this.db.collection<OrderDispatch>(OrderDispatch.collectionName).doc(id).update({
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
      this.alertService.showToaster(values.dispatchID+' Modified' , { classname: 'bg-success text-light', delay: 10000 })
    });
  }

  deliverOrder(id , dispatchID) {
    return this.db.collection(OrderDispatch.collectionName).doc(id).update({status: 'Delivered',
    dateLastModified: new Date(), lastModifiedBy: this.authService.userName()})
    .then((res) => {
      this.alertService.showToaster(dispatchID+ 'Delivered', { classname: 'bg-success text-light', delay: 10000 });
    })
    .catch((_error) => {
      console.log('' + OrderDispatch.collectionName + ' Delete Failed!', _error);
    });
  }

  claimOrder(id, values) {
    this.genService.claimCodeCheck(OrderDispatch, id, values.claimCodeEntered).then(val => {
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
              orderItem.quantity = vals;
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
      this.db.collection(OrderDispatch.collectionName).doc(id).update({

        status: 'Claimed',
        isCompleted: true,
        dateClaimed: new Date(),
        dateLastModified: new Date(),
        lastModifiedBy: this.authService.userName()

      }).then((res) => {
        this.alertService.showToaster(values.dispatchID+ ' Claimed', { classname: 'bg-success text-light', delay: 10000 });
      })
      .catch((_error) => {
        console.log('' + OrderDispatch.collectionName + ' Delete Failed!', _error);
      });
    })
  }

  archiveRequest(id) {
    return this.firebase.archiveOne(RequestDispatch, id);
  }
  restoreRequest(id){
    return this.firebase.restoreOne(RequestDispatch, id);
  }
  deleteRequest(id) {
    return this.firebase.deleteOne(RequestDispatch, id);
  }

  archiveOrder(id) {
    return this.firebase.archiveOne(OrderDispatch, id);
  }
  restoreOrder(id){
    return this.firebase.restoreOne(OrderDispatch, id);
  }
  deleteOrder(id) {
    return this.firebase.deleteOne(OrderDispatch, id);
  }
}
