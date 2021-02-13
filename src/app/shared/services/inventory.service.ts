import { Injectable } from '@angular/core';
import { FirebaseService  } from './firebase.service';
import { AuthService  } from './auth.service';
import { Inventory } from '../model';
import { AngularFirestore } from '@angular/fire/firestore';
import { AlertService } from './alert.service';
import { InitEventComponent } from 'src/app/components/events/events.component';
import { EMPTY } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class InventoryService {

  constructor(
    public firebase: FirebaseService,
    public db: AngularFirestore,
    public authService: AuthService,
    public alertService: AlertService) {

  }

  getAll(){
    return this.firebase.getAllData<Inventory>(Inventory);
  }

  getAllFiltered(filter){
    return this.firebase.getAllData<Inventory>(Inventory);
  }

  getAllActive(orderField){
    const filters = {
      value1: 'isArchived',
      expression1: '==',
      value2: false,
      value3: '',
      expression2: '',
      value4: '',
    };
    return this.firebase.getAllData<Inventory>(Inventory, 1 , filters, orderField);
  }

  getAllArchived(){
    const filters = {
      value1: 'isArchived',
      expression1: '==',
      value2: true,
      value3: '',
      expression2: '',
      value4: '',
    };
    return this.firebase.getAllData<Inventory>(Inventory, 1 , filters);
  }
  getOne(id: string){
    return this.firebase.getOne<Inventory>(Inventory , id);
  }
  getInventoryOfPartner(partnerID) {
    const filters = {
      value1: 'partnerID',
      expression1: '==',
      value2: partnerID,
      value3: 'isArchived',
      expression2: '==',
      value4: false,
    };
    return this.firebase.getAllData(Inventory, 1 , filters);
  }

  getByPTRandBT(partnerID , bloodType) {
    const filters = {
      value1: 'partnerID',
      expression1: '==',
      value2: partnerID,
      value3: 'bloodType',
      expression2: '==',
      value4: bloodType,
    };
    return this.firebase.getAllData(Inventory, 2 , filters);
  }

  updateOne(id: string, values) {
    let isEmpty = false;
    if(values.quantity ===  0) {
      isEmpty = true;
    }
    this.db.collection<Inventory>(Inventory.collectionName).doc(id).update({
      quantity: values.quantity,
      isEmpty,
      dateLastModified: new Date(),
      lastModifiedBy:  this.authService.userName()
    }).catch(error => {
      throw new Error('Error: Updating document:' + error);
    }).then( () => {
      this.alertService.showToaster(values.batchID+' Batch Quantity Modified' ,
      { classname: 'bg-success text-light', delay: 10000 })
    });
  }

  async getAndSubtract(id , quantity) {
    const query = await this.db.collection(Inventory.collectionName).doc(id).get();
    const snapshot = query.toPromise();
      if (snapshot !== undefined){
        const oldQuantity = (await snapshot).data().quantity
        const newQuanity = oldQuantity - quantity
        if (Math.sign(newQuanity) >= 0 ) {
          return newQuanity
        } else {
          return EMPTY
        }
      } else {
        return EMPTY
      }
  }

  manualExpire(id: string, value) {
    this.db.collection<Inventory>(Inventory.collectionName).doc(id).update({
      isExpired: true,
      dateLastModified: new Date(),
      lastModifiedBy:  this.authService.userName()
    }).catch(error => {
      throw new Error('Error: Updating document:' + error);
    }).then( () => {
      this.alertService.showToaster(value.batchID+' Manual Expiry' ,
      { classname: 'bg-success text-light', delay: 10000 })
    });
  }

  archive(id: string) {
    return this.firebase.archiveOne(Inventory, id);
  }
  restore(id: string){
    return this.firebase.restoreOne(Inventory, id);
  }
  delete(id: string) {
    return this.firebase.deleteOne(Inventory, id);
  }
}
