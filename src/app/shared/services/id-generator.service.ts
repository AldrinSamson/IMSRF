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

    if( model.modelName === 'partner' ||  model.modelName === 'requestBlood' && option === undefined) {  // Singled Numbered
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
    } else if ( model.modelName === 'event') { // Double with Date

      const idNum = option.partnerID.substring(4);
      const dateCode = this.dateSixDigitCode(option.dateOfEvent);
      const newID = model.prefix + '-' + idNum + '-' + dateCode
      return {newID , dateCode}

    } else if ( model.modelName === 'dispatchBlood') { // Double with other ID

      const idNum = option.requestID.substring(4);
      const idNum2 = option.partnerID.substring(4);
      const newID = model.prefix + '-' + idNum + '-' + idNum2
      return {newID}

    }else if ( model.modelName === 'inventory') { // Triple with other ID

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

  claimCodeRNG() {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    for ( let i = 0; i < 5; i++ ) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
  }

  async claimCodeCheck(model, id, claimCode){
    const query = await this.db.collection(model.collectionName).doc(id).get()
      const snapshot = query.toPromise();
      if (snapshot !== undefined){
        if ((await snapshot).data().claimCode === claimCode) {
          return true
        }else{
          return false
        }
      } else {
        return false
      }
  }
}



