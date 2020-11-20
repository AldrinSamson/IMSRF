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
  getOne(id: string){
    return this.firebase.getOne<Inventory>(Inventory , id);
  }
  getInventoryOfPartner(partnerID) {
    return this.firebase.getWithOneFilter(Inventory,  'partnerID', '==', partnerID )
  }

  getByPTRandBT(partnerID , bloodType) {
    return this.firebase.getWithTwoFilter(Inventory, 'partnerID', '==', partnerID , 'bloodType', '==', bloodType);
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
