import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { AlertService } from './alert.service';
import * as firebase from 'firebase/app';
import { Observable } from 'rxjs';
import 'firebase/auth';
@Injectable({
  providedIn: 'root'
})
export class FirebaseService {

  constructor(public db: AngularFirestore , public alertService: AlertService) {}

  getAllData<T>(model: T | any, filterCount:number = 0, filterValues?: { value1: string ; expression1: any; value2: any;
    value3: string ; expression2: any; value4: any; }, orderField:string = 'dateCreated', orderDirection: any = 'desc')
    : Observable<T[]> {

    switch(filterCount) {
      case 0:
        return this.db.collection<T>(model.collectionName, ref => ref.orderBy(orderField, orderDirection)).valueChanges({idField: 'id'});
      case 1:
        return this.db.collection<T>(model.collectionName, ref => ref.where(filterValues.value1,
          filterValues.expression1 , filterValues.value2).orderBy(orderField, orderDirection)).valueChanges({idField: 'id'});
      case 2:
        return this.db.collection<T>(model.collectionName, ref => ref.where(filterValues.value1 ,filterValues.expression1 ,
          filterValues.value2).where(filterValues.value3 , filterValues.expression2 ,
            filterValues.value4).orderBy(orderField, orderDirection)).valueChanges({idField: 'id'});
    }
  }


  getOne<T>( model: T | any, id: string) {
    return this.db.collection<T>(model.collectionName).doc(id).valueChanges();
  }

  // DONUT USE unless you're submitting the full form data
  updateOne<T>(model: T | any, id: string, value) {
    return this.db.collection(model.collectionName).doc(id).set(value)
    .then((res) => {
      this.alertService.showToaster('Update Success', { classname: 'bg-success text-light', delay: 10000 });
    })
    .catch((_error) => {
      console.log('' + model.collectionName + ' Update Failed!', _error);
    });
  }

  addOne<T>(model: T | any, value) {
    return this.db.collection(model.collectionName).add(value)
    .then((res) => {
      this.alertService.showToaster('Create Success', { classname: 'bg-success text-light', delay: 10000 });
    })
    .catch((_error) => {
      console.log('' + model.collectionName + ' Create Failed!', _error);
    });
  }
  //

  deleteOne<T>(model: T | any, id: string) {
    return this.db.collection(model.collectionName).doc(id).delete()
    .then((res) => {
      this.alertService.showToaster('Delete Success', { classname: 'bg-success text-light', delay: 10000 });
    })
    .catch((_error) => {
      console.log('' + model.collectionName + ' Delete Failed!', _error);
    });
  }

  archiveOne(model, id) {
    return this.db.collection(model.collectionName).doc(id).update({isArchived: true})
    .then((res) => {
      this.alertService.showToaster('Archive Success', { classname: 'bg-success text-light', delay: 10000 });
    })
    .catch((_error) => {
      console.log('' + model.collectionName + ' Archive Failed!', _error);
    });
  }

  restoreOne(model, id) {
    return this.db.collection(model.collectionName).doc(id).update({isArchived: false})
    .then((res) => {
      this.alertService.showToaster('Restore Success', { classname: 'bg-success text-light', delay: 10000 });
    })
    .catch((_error) => {
      console.log('' + model.collectionName + ' Restore Failed!', _error);
    });
  }

  audit(service , action) {
    const userDetails = JSON.parse(sessionStorage.getItem('session-user-details'));
    this.db.collection('audit').add({
      date: new Date(),
      level: userDetails.position,
      name: userDetails.fullName,
      uid: userDetails.uid,
      type: service,
      // tslint:disable-next-line: object-literal-shorthand
      action: action
    });
  }
}
