import { Injectable } from '@angular/core';
import { FirebaseService  } from './firebase.service';
import { IdGeneratorService } from './id-generator.service';
import { AuthService  } from './auth.service';
import { Partner } from '../model';
import { AngularFirestore } from '@angular/fire/firestore';
import { AlertService } from './alert.service';

@Injectable({
  providedIn: 'root'
})
export class PartnerService {

  constructor( public firebase: FirebaseService,
    public db: AngularFirestore,
    public authService: AuthService,
    public genService: IdGeneratorService,
    public alertService: AlertService) {

  }

  getAll(){
    return this.firebase.getAllData<Partner>(Partner);
  }
  getOne(id){
    return this.firebase.getOne<Partner>(Partner , id);
  }

  addOne(values) {
    this.genService.generateID(Partner).then(val => {
        this.db.collection<Partner>(Partner.collectionName).add({
        partnerID: val[0],
        num: val[1],
        institutionName: values.institutionName,
        dateCreated: new Date(),
        dateLastModified: new Date(),
        createdBy: 'admin',
        lastModifiedBy: 'admin'
      });
      this.alertService.showToaster(values.institutionName+' Partner Added' , { classname: 'bg-success text-light', delay: 10000 })
    })

  }

  updateOne(id, values) {
    this.db.collection<Partner>(Partner.collectionName).doc(id).update({
      institutionName: values.institutionName,
      dateLastModified: new Date(),
      lastModifiedBy: 'admin'
    });
    this.alertService.showToaster(values.institutionName+' Partner Modified' , { classname: 'bg-success text-light', delay: 10000 })
  }

  archive(id) {
    return this.firebase.archiveOne(Partner, id);
  }
  restore(id){
    return this.firebase.restoreOne(Partner, id);
  }
  delete(id) {
    return this.firebase.deleteOne(Partner, id);
  }
}
