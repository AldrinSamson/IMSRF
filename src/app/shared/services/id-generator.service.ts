import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { Subscription } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class IdGeneratorService {


  constructor(public db: AngularFirestore) { }

  async generateID(model , option?) {

    if( model.modelName === 'partner' || option === 'undefined') {
      let lastNum: any;
      let newNum: any;
      let newID: any;
      const query = await this.db.collection(model.collectionName).ref.orderBy('num', 'desc').limit(1).get();
      const snapshot = query.docs[0];
      if (snapshot !== undefined){
        lastNum = snapshot.data().num;
        newNum = lastNum+1;
        newID = model.prefix + '-' + newNum;
        return {newID,newNum};
      }else{
        newNum = 1;
        newID = model.prefix + '-' + newNum;
        return {newID,newNum};
      }
    } else if ( model.modelName === 'event') {

      const partnerNum = option.partnerID.substring(4);
      const dateCode = this.dateSixDigitCode(option.dateOfEvent);
      const newID = model.prefix + '-' + partnerNum + '-' + dateCode
      return {newID , dateCode}

    } else if ( model.modelName === 'inventory') {

      const partnerAndEvent = option.eventID.substring(4);
      const newID = model.prefix + '-' + partnerAndEvent + '-' + option.bloodTypeCode
      return {newID}

    } else {
      console.log('Invalid inputs')
    }
  }

  dateSixDigitCode(date) {
    const dd = String(date.getDate()).padStart(2, '0');
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const yy =  String(date.getFullYear()).substring(2);

    return mm+dd+yy
  }
}



