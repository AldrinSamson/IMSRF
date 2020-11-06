import { Injectable } from '@angular/core';
import { FirebaseService } from './firebase.service';
import { AuthService } from './auth.service';
import { User } from '../model';
import { AngularFirestore } from '@angular/fire/firestore';
import { AngularFireAuth } from '@angular/fire/auth';
import { AlertService } from './alert.service';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor(
    public firebase: FirebaseService,
    public db: AngularFirestore,
    public authService: AuthService,
    public alertService: AlertService,
    public afAuth: AngularFireAuth) {

  }

  getAll(){
    return this.firebase.getAllData<User>(User);
  }

  getOne(id){
    return this.firebase.getOne<User>(User , id);
  }

  getStaff() {
    return this.firebase.getWithOneFilter(User, 'institutionName', '==', 'The Red Bank Foundation')
  }

  getPartner() {
    return this.firebase.getWithOneFilter(User, 'position', '==', 'Partner')
  }

  addOne(values) {
    return new Promise(resolve => {
      this.afAuth.createUserWithEmailAndPassword(values.email, values.password)
        .then((authData) => {
          this.db.collection<User>(User.collectionName).add({
            uid: authData.user.uid,
            firstName: values.firstName,
            lastName: values.lastName,
            fullName: values.fullName,
            email: values.email,
            contactNumber: values.contactNumber,
            photoUrl: values.photoUrl,
            position: values.position,
            institutionName: values.institutionName,
            partnerID: values.partnerID,
            dateCreated: values.dateCreated,
            dateLastModified: values.dateLastModified,
            createdBy: values.createdBy,
            lastModifiedBy: values.lastModifiedBy
          });
          this.alertService.showToaster('User Create Success'  , { classname: 'bg-success text-light', delay: 10000 });
        })
        .catch((_error) => {
          this.alertService.showToaster('User Create Failed!, ' + _error.message  , { classname: 'bg-warning text-light', delay: 10000 });
          console.log('Broker Create Failed!', _error);
        });
    });
  }

  updateOne(id, value) {
    this.db.collection<User>(User.collectionName).doc(id).update({
      firstName: value.firstName,
      lastName: value.lastName,
      fullName: value.firstName + ' ' + value.lastName,
      contactNumber: value.contactNumber,
      institutionName: value.institutionName,
      partnerID: value.partnerID,
      dateLastModified: new Date(),
      lastModifiedBy: this.authService.userName()
    });
    this.alertService.showToaster( value.firstName + ' ' + value.lastName+' User Modified',
    { classname: 'bg-success text-light', delay: 10000 })
  }

  archive(id) {
    return this.firebase.archiveOne(User, id);
  }
  restore(id){
    return this.firebase.restoreOne(User, id);
  }
  delete(id) {
    return this.firebase.deleteOne(User, id);
  }
}
