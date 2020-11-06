import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { Subscription } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class IdGeneratorService {


  constructor(public db: AngularFirestore) { }

  async generateID(model) {
    let lastNum: any;
    let newNum: any;
    let newID: any;
    const query = await this.db.collection(model.collectionName).ref.orderBy('num', 'desc').limit(1).get();
    const snapshot = query.docs[0];
    if (snapshot !== undefined){
      lastNum = snapshot.data().num;
      newNum = lastNum+1;
      newID = model.prefix + '-' + newNum;
      return [newID,newNum];
    }else{
      newNum = 1;
      newID = model.prefix + '-' + newNum;
      return [newID,newNum];
    }
  }
}



