import { Injectable } from '@angular/core';
import { Requester } from '../model';
import { FirebaseService  } from './firebase.service';
import { IdGeneratorService } from './id-generator.service';
import { AuthService } from './auth.service';
import { AngularFirestore } from '@angular/fire/firestore';
import { AngularFireAuth } from '@angular/fire/auth';
import { AlertService } from './alert.service';

@Injectable({
  providedIn: 'root'
})
export class RequesterService {

  constructor( public firebase: FirebaseService,
    public db: AngularFirestore,
    public authService: AuthService,
    public genService: IdGeneratorService,
    public alertService: AlertService,
    public afAuth: AngularFireAuth) { }

  getAll(){
    const filters = {
      value1: '',
      expression1: '',
      value2: '',
      value3: '',
      expression2: '',
      value4: '',
    };
    return this.firebase.getAllData<Requester>(Requester, 0, filters);
  }

  getActive(){
    const filters = {
      value1: 'isActive',
      expression1: '==',
      value2: true,
      value3: '',
      expression2: '',
      value4: '',
    };
    return this.firebase.getAllData<Requester>(Requester, 1, filters);
  }

  getDeactivated(){
    const filters = {
      value1: 'isActive',
      expression1: '==',
      value2: false,
      value3: '',
      expression2: '',
      value4: '',
    };
    return this.firebase.getAllData<Requester>(Requester, 1, filters);
  }

  getOne(id){
    return this.firebase.getOne<Requester>(Requester , id);
  }

  addOne(values) {
    return new Promise(resolve => {
      this.afAuth.createUserWithEmailAndPassword(values.email, values.password)
        .then((authData) => {
          this.genService.generateID(Requester).then(val => {
            this.db.collection<Requester>(Requester.collectionName).add({
            uid: authData.user.uid,
            requesterID: val.newID,
            num: val.newNum,
            contactNumber: values.contactNumber,
            email: values.email,
            firstName: values.firstName,
            lastName: values.lastName,
            fullName: values.fullName,
            mailingAddress: values.mailingAddress,
            birthday: values.birthday,
            sex: values.sex,
            requesterPhotoUrl: values.requesterPhotoUrl,
            isActive: true,
            dateCreated: new Date(),
            dateLastModified: new Date(),
            createdBy: this.authService.userName(),
            lastModifiedBy: this.authService.userName()
          });
          this.alertService.showToaster('User Create Success'  , { classname: 'bg-success text-light', delay: 10000 });
          this.firebase.audit('Requester' , 'Created Requester ' + values.fullName, val.newID);
          }).catch(error => {
            throw new Error('Error: Updating document:' + error);
          }).then( () => {
            this.alertService.showToaster(values.fullName+' Requester Added' , { classname: 'bg-success text-light', delay: 10000 })
          });
        })
        .catch((_error) => {
          this.alertService.showToaster('User Create Failed' + _error.message  , { classname: 'bg-warning text-light', delay: 10000 });
          console.log('User Create Failed!', _error);
        });
    });
  }

  updateOne(id, values) {
    this.db.collection<Requester>(Requester.collectionName).doc(id).update({
      firstName: values.firstName,
      lastName: values.lastName,
      fullName: values.fullName,
      mailingAddress: values.mailingAddress,
      birthday: values.birthday,
      sex: values.sex,
      dateLastModified: new Date(),
      lastModifiedBy:  this.authService.userName()
    }).catch(error => {
      throw new Error('Error: Updating document:' + error);
    }).then( () => {
      this.firebase.audit('Requester' , 'Modified Requester ' + values.fullName, values.requesterID);
      this.alertService.showToaster(values.fullName+' Requester Modified' , { classname: 'bg-success text-light', delay: 10000 })
    });
  }

  activate(id, values) {
    this.firebase.audit('Requester' , 'Activated Requester ' + values.fullName, values.requesterID);
    return this.firebase.activateOne(Requester, id);
  }
  deactivate(id, values){
    this.firebase.audit('Requester' , 'Deactivated Requester ' + values.fullName, values.requesterID);
    return this.firebase.deactivateOne(Requester, id);
  }
  delete(id, values) {
    this.firebase.audit('Requester' , 'Deleted Requester ' + values.fullName, values.requesterID);
    return this.firebase.deleteOne(Requester, id);
  }
}
