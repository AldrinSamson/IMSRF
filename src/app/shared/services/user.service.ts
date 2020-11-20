import { Injectable } from '@angular/core';
import { FirebaseService } from './firebase.service';
import { AuthService } from './auth.service';
import { User , Audit} from '../model';
import { AngularFirestore } from '@angular/fire/firestore';
import { AngularFireAuth } from '@angular/fire/auth';
import { AlertService } from './alert.service';
import * as fb from 'firebase/app';
import 'firebase/auth';


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

  getAllAudit() {
    return this.firebase.getAllData<Audit>(Audit);
  }

  updateCurrentUserPassword(value) {
    const currentUser = fb.auth().currentUser;
    const userDetails = JSON.parse(sessionStorage.getItem('session-user-details'));
    const credentials = fb.auth.EmailAuthProvider.credential(userDetails.email, value.oldPassword);

    currentUser.reauthenticateWithCredential(credentials).then(
        success => {
          if (value.newPassword !== value.newPasswordConfirm){
           this.alertService.showToaster('You did not confirm your password correctly.' ,
            { classname: 'bg-success text-warning', delay: 10000 });
          } else if (value.newPassword.length < 6){
            this.alertService.showToaster('Your password should be at least 6 characters long' ,
            { classname: 'bg-success text-warning', delay: 10000 });
          } else {
            this.alertService.showToaster('Your password has been updated!' ,
            { classname: 'bg-success text-warning', delay: 10000 });
            currentUser.updatePassword(value.newPassword).then(res => {
              console.log(res);
              return true
            }).catch( error => {
              console.log(error);
            });
          }
        },
        error => {
          console.log(error);
          if(error.code === 'auth/wrong-password'){
            this.alertService.showToaster('Your old password is invalid.' ,
            { classname: 'bg-success text-warning', delay: 10000 });
          }
        }
      )
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
            dateCreated: new Date(),
            dateLastModified: new Date(),
            createdBy: this.authService.userName(),
            lastModifiedBy: this.authService.userName()
          });
          this.alertService.showToaster('User Create Success'  , { classname: 'bg-success text-light', delay: 10000 });
        })
        .catch((_error) => {
          this.alertService.showToaster('User Create Failed' + _error.message  , { classname: 'bg-warning text-light', delay: 10000 });
          console.log('User Create Failed!', _error);
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
    }).catch(error => {
      throw new Error('Error: Updating document:' + error);
    }).then( () => {
      this.alertService.showToaster(value.firstName + ' ' + value.lastName+' User Modified',
    { classname: 'bg-success text-light', delay: 10000 })
    });
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
