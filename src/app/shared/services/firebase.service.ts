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

  getAllData<T>(model: T | any): Observable<T[]> {
    return this.db.collection<T>(model.collectionName).valueChanges({idField: 'id'});
  }

  getWithOneFilter<T>(model: T | any , value1 , expression , value2): Observable<T[]> {
    return this.db.collection<T>(model.collectionName, ref => ref.where(value1 , expression , value2)).valueChanges({idField: 'id'});
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

  getUserDetails() {
    // tslint:disable-next-line: prefer-const
    let uid: any;
    firebase.auth().onAuthStateChanged(function(user) {
      if (user != null) {
        this.uid = user.uid;
      } else {
        this.uid = 'Error/Unknown';
      }
    });
    return uid;
  }

  audit(service , action) {
    const userDetails = JSON.parse(sessionStorage.getItem('session-user-details'));
    this.db.collection('audit').add({
      date: new Date(),
      level: userDetails.position,
      name: userDetails.fullName,
      type: service,
      // tslint:disable-next-line: object-literal-shorthand
      action: action
    });
  }
}


  // restoreOne(id, collectionName) {
  //   return this.db.collection(collectionName).doc(id).update({isArchived: false})
  //   .then((res) => {
  //     this.alertService.showToaster('Restore Success');
  //   })
  //   .catch((_error) => {
  //     console.log('' + collectionName + ' Restore Failed!', _error);
  //   });
  // }

  // archiveOne(id, collectionName) {
  //   return this.db.collection(collectionName).doc(id).update({isArchived: true})
  //   .then((res) => {
  //     this.alertService.showToaster('Archive Success');
  //   })
  //   .catch((_error) => {
  //     console.log('' + collectionName + ' Archive Failed!', _error);
  //   });
  // }

  // deleteOne(id , collectionName) {
  //   return this.db.collection(collectionName).doc(id).delete()
  //   .then((res) => {
  //     this.alertService.showToaster('Delete Success');
  //   })
  //   .catch((_error) => {
  //     console.log('' + collectionName + ' Delete Failed!', _error);
  //   });
  // }

  // addOne(value , collectionName) {
  //   return this.db.collection(collectionName).add(value)
  //   .then((res) => {
  //     this.alertService.showToaster('Create Success');
  //   })
  //   .catch((_error) => {
  //     console.log('' + collectionName + ' Create Failed!', _error);
  //   });
  // }

  // updateOne(id, value , collectionName) {
  //   return this.db.collection(collectionName).doc(id).set(value)
  //   .then((res) => {
  //     this.alertService.showToaster('Update Success');
  //   })
  //   .catch((_error) => {
  //     console.log('' + collectionName + ' Update Failed!', _error);
  //   });
  // }
