import { Injectable } from '@angular/core';
import { FirebaseService  } from './firebase.service';
import { AuthService  } from './auth.service';
import { Donor } from '../model';
import { AngularFirestore } from '@angular/fire/firestore';
import { AlertService } from './alert.service';

@Injectable({
  providedIn: 'root'
})
export class DonorService {

  constructor(
    public firebase: FirebaseService,
    public db: AngularFirestore,
    public authService: AuthService,
    public alertService: AlertService) {

  }

  getAll(){
    return this.firebase.getAllData<Donor>(Donor);
  }

  getOne(id){
    return this.firebase.getOne<Donor>(Donor , id);
  }

  getActive(){
    const filters = {
      value1: 'isArchived',
      expression1: '==',
      value2: false,
      value3: '',
      expression2: '',
      value4: '',
    };
    return this.firebase.getAllData(Donor, 1 , filters);
  }

  addOne(value) {
    this.db.collection<Donor>(Donor.collectionName).add({
      firstName: value.firstName,
      lastName: value.lastName,
      fullName: value.firstName + ' ' + value.lastName,
      mailingAddress: value.mailingAddress,
      email: value.email,
      birthday: value.birthday,
      sex: value.sex,
      bloodType: value.bloodType,
      donorPhotoUrl: value.donorPhotoUrl,
      isArchived: false,
      dateCreated: new Date(),
      createdBy: this.authService.userName(),
      dateLastModified: new Date(),
      lastModifiedBy: this.authService.userName()
    }).catch(error => {
      throw new Error('Error: Updating document:' + error);
    }).then( () => {
      this.alertService.showToaster(value.firstName + ' ' + value.lastName+' User Modified',
    { classname: 'bg-success text-light', delay: 10000 })
    });

  }

  updateOne(id, value) {
    this.db.collection<Donor>(Donor.collectionName).doc(id).update({
      firstName: value.firstName,
      lastName: value.lastName,
      fullName: value.firstName + ' ' + value.lastName,
      mailingAddress: value.mailingAddress,
      email: value.email,
      birthday: value.birthday,
      sex: value.sex,
      bloodType: value.bloodType,
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
    return this.firebase.archiveOne(Donor, id);
  }
  restore(id){
    return this.firebase.restoreOne(Donor, id);
  }
  delete(id) {
    return this.firebase.deleteOne(Donor, id);
  }

}
