import { Injectable } from '@angular/core';
import { FirebaseService  } from './firebase.service';
import { IdGeneratorService } from './id-generator.service';
import { AuthService } from './auth.service';
import { Event , Inventory , BloodTypes } from '../model';
import { AngularFirestore } from '@angular/fire/firestore';
import { AlertService } from './alert.service';

@Injectable({
  providedIn: 'root'
})
export class EventService {

  constructor(
    public firebase: FirebaseService,
    public db: AngularFirestore,
    public authService: AuthService,
    public genService: IdGeneratorService,
    public alertService: AlertService) {

  }

  getAll(){
    return this.firebase.getAllData<Event>(Event);
  }
  getOne(id){
    return this.firebase.getOne<Event>(Event , id);
  }

  getEventsOfPartner(partnerID) {
    const filters = {
      value1: 'isSubmitted',
      expression1: '==',
      value2: false,
      value3: 'partnerID',
      expression2: '==',
      value4: partnerID,
    };
    return this.firebase.getAllData(Event, 2, filters);
  }

  getActive() {
    const filters = {
      value1: 'isSubmitted',
      expression1: '==',
      value2: false,
      value3: 'isArchived',
      expression2: '==',
      value4: false,
    };
    return this.firebase.getAllData(Event, 2, filters);
  }

  getHistorical() {
    const filters = {
      value1: 'isSubmitted',
      expression1: '==',
      value2: true,
      value3: 'isArchived',
      expression2: '==',
      value4: false,
    };
    return this.firebase.getAllData(Event, 2 , filters);
  }

  getArchived() {
    const filters = {
      value1: 'isArchived',
      expression1: '==',
      value2: true,
      value3: '',
      expression2: '',
      value4: '',
    };
    return this.firebase.getAllData(Event, 1 , filters);
  }

  // Pre-Event
  initPreEvent(values) {
    this.genService.generateID(Event , values).then(val => {
      this.db.collection<Event>(Event.collectionName).add({
      eventID: val.newID,
      partnerID: values.partnerID,
      institutionName: values.institutionName,
      dateOfEvent: values.dateOfEvent,
      dateOfEventShort: val.dateCode,
      location: values.location,

      dateSubmitted: null,
      donorsRegistered: null,
      donorsDefferTotal: null,
      donorsDefferScreen: null,
      donorsDefferLow: null,
      donorsBledTotal: null,
      donorsBledOk: null,
      donorsBledFail: null,

      dateExpiry: null,
      quantityAP: null,
      quantityAN: null,
      quantityBP: null,
      quantityBN: null,
      quantityOP: null,
      quantityON: null,
      quantityABP: null,
      quantityABN: null,
      quantityTotal: null,
      remarks: null,

      // Meta Data
      isSubmitted: false,
      isCataloged: false,
      isArchived: false,
      searchTags: [val.newID, values.partnerID, values.dateOfEvent],
      batchIDIndex: null,

      dateCreated: new Date(),
      dateLastModified: new Date(),
      createdBy: this.authService.userName(),
      lastModifiedBy: this.authService.userName()
    })}).catch(error => {
      throw new Error('Error: Adding document:' + error);
    }).then( () => {
      this.alertService.showToaster(values.institutionName+' Event Added' , { classname: 'bg-success text-light', delay: 10000 })
    })
  }

  updatePreEvent(id, values) {
    this.genService.generateID(Event , values).then(val => {
      this.db.collection<Event>(Event.collectionName).doc(id).update({
        eventID: val.newID,
        partnerID: values.partnerID,
        institutionName: values.institutionName,
        dateOfEvent: values.dateOfEvent,
        dateOfEventShort: val.dateCode,
        location: values.location,

        dateLastModified: new Date(),
        lastModifiedBy: this.authService.userName()
      }).catch(error => {
        throw new Error('Error: Updating document:' + error);
      }).then( () => {
        this.alertService.showToaster(values.institutionName+' Event Update' , { classname: 'bg-success text-light', delay: 10000 })
      });
    });
  }

  updateToPostEventAndAddToInvetory(id, values) {
    const batchIDCollection = [];

    this.db.collection<Event>(Event.collectionName).doc(id).update({
      dateSubmitted: new Date(),
      donorsRegistered: values.donorsRegistered,
      donorsDefferTotal: values.donorsDefferTotal,
      donorsDefferScreen: values.donorsDefferScreen,
      donorsDefferLow: values.donorsDefferLow,
      donorsBledTotal: values.donorsBledTotal,
      donorsBledOk: values.donorsBledOk,
      donorsBledFail: values.donorsBledFail,

      dateExpiry: values.dateExpiry,
      quantityAP: values.quantityAP,
      quantityAN: values.quantityAN,
      quantityBP: values.quantityBP,
      quantityBN: values.quantityBN,
      quantityOP: values.quantityOP,
      quantityON: values.quantityON,
      quantityABP: values.quantityABP,
      quantityABN: values.quantityABN,
      quantityTotal: values.quantityTotal,
      remarks: values.remarks,

      isSubmitted: true,

      dateLastModified: new Date(),
      lastModifiedBy: this.authService.userName()
    }).catch(error => {
      throw new Error('Error: Updating document:' + error);
    }).then( () => {

      // Add Blood Batch loop
      const bloodQuantity = [values.quantityAP, values.quantityAN, values.quantityBP, values.quantityBN,
        values.quantityOP, values.quantityON, values.quantityABP, values.quantityABN]

        let i = 0;
        while (i < bloodQuantity.length ) {
        const idVariables = {eventID: values.eventID , bloodTypeCode: BloodTypes.bloodTypeCode[i]}
        const bloodTypeValue = BloodTypes.bloodTypes[i];
        const bloodTypeCodeValue = BloodTypes.bloodTypeCode[i];
        const quantityValue = bloodQuantity[i];
        this.genService.generateID(Inventory , idVariables).then(val => {
          if (quantityValue !== 0) {
            this.db.collection<Inventory>(Inventory.collectionName).add({
              batchID: val.newID,
              partnerID: values.partnerID,
              eventID: values.eventID,
              institutionName: values.institutionName,

              bloodType: bloodTypeValue,
              bloodTypeCode: bloodTypeCodeValue,
              quantity: quantityValue,
              dateExpiry: values.dateExpiry,

              // Meta Data
              isExpired: false,
              isEmpty: false,
              isArchived: false,
              searchTags: [val.newID, values.partnerID, values.eventID, values.dateExpiry, bloodTypeValue],

              dateCreated: new Date(),
              dateLastModified: new Date(),
              createdBy: this.authService.userName(),
              lastModifiedBy: this.authService.userName()
            });
          }
          batchIDCollection.push(val.newID);
        }).catch(error => {
          throw new Error('Error: Creating document:' + error);
        }).then( () => {
          this.alertService.showToaster('Blood Type '+bloodTypeValue+' Batch Successfully Added',
          { classname: 'bg-success text-light', delay: 10000 })
        });;
        i++;
      }
    }).finally( ()=> {
      this.db.collection<Event>(Event.collectionName).doc(id).update({
        isCataloged: true,
        batchIDIndex: batchIDCollection,
        dateLastModified: new Date(),
        lastModifiedBy: this.authService.userName()
      }).catch(error => {
        throw new Error('Error: Updating document:' + error);
      }).then( () => {
        this.alertService.showToaster(values.eventID+' of '+ values.institutionName +' Event Update',
        { classname: 'bg-success text-light', delay: 10000 })
      });
    });
  }

  archive(id) {
    return this.firebase.archiveOne(Event, id);
  }
  restore(id){
    return this.firebase.restoreOne(Event, id);
  }
  delete(id) {
    return this.firebase.deleteOne(Event, id);
  }
}
