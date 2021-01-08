import { Injectable, NgZone } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFirestore } from '@angular/fire/firestore';
import { Router } from '@angular/router';
import * as firebase from 'firebase/app';
import 'firebase/auth';
import { AlertService } from './alert.service';
import { FirebaseService } from './firebase.service';

@Injectable()
export class AuthService {
  public token: any;
  userDetails: Array<any>;
  userUid: any;
  userPosition: any;


  constructor(public afAuth: AngularFireAuth,
    private router: Router,
    private db: AngularFirestore,
    private alert: AlertService,
    public fbs: FirebaseService
    ) { }

  async login(email: string, password: string) {
    try {
      this.alert.showToaster('Autheticating ...');
      const result = await this.afAuth.signInWithEmailAndPassword(email, password).then( res => {
        this.userUid = res.user.uid;
        // tslint:disable-next-line: no-shadowed-variable
        this.db.collection('user', ref => ref.where('uid', '==', res.user.uid)).valueChanges({idField: 'id'}).forEach( result => {
          this.userDetails = result;
          if (result.length !== 0) {
            sessionStorage.setItem('session-alive', 'true');
            sessionStorage.setItem('session-user-uid', this.userUid);
            sessionStorage.setItem('session-user-details', JSON.stringify(this.userDetails[0]));
            this.fbs.audit('Authentication' , 'Logged In');
            this.alert.showToaster('Logged In!');
            if (this.userDetails[0].position === 'Partner') {
              this.router.navigate(['/partner']);
            }else {
              this.router.navigate(['/main']);
            }
          } else {
            this.alert.showToaster('Error');
          }

      });
      });
    } catch (err) {
      console.log(err);
      this.alert.showToaster('Email or Password is wrong');
    }
  }

  public logout(): void {
    this.fbs.audit('Authentication' , 'Logged Out');
    sessionStorage.removeItem('session-alive');
    sessionStorage.removeItem('session-user-uid');
    sessionStorage.removeItem('session-user-details');
    this.token = null;
    this.router.navigate(['/']);
  }

  public getIdToken(): string {
   firebase.auth().currentUser.getIdToken()
      .then(
        (token: string) => this.token = token
      );
    return this.token;
  }

  public isAuthenticated(): string {
    this.userPosition = JSON.parse(sessionStorage.getItem('session-user-details'));
    if (this.userPosition.position === 'Admin' || this.userPosition.position === 'Staff') {
      return sessionStorage.getItem('session-alive');
    }
    return 'false'
  }

  public isPartnerAuthenticated(): string {
    this.userPosition = JSON.parse(sessionStorage.getItem('session-user-details'));
    if (this.userPosition.position === 'Partner') {
      return sessionStorage.getItem('session-alive');
    }

    return 'false'
  }

  public isAdmin() {
    this.userPosition = JSON.parse(sessionStorage.getItem('session-user-details'));
    if (!this.isAuthenticated()) {
      return false;
    } else if (this.userPosition.position === 'Admin') {
      return true;
    } else {
      return false;
    }
  }

  public isStaff() {
    this.userPosition = JSON.parse(sessionStorage.getItem('session-user-details'));
    if (!this.isAuthenticated()) {
      return false;
    } else if (this.userPosition.position === 'Staff') {
      return true;
    } else {
      return false;
    }
  }

  public isPartner() {
    this.userPosition = JSON.parse(sessionStorage.getItem('session-user-details'));
    if (!this.isAuthenticated() || !this.isPartnerAuthenticated()) {
      return false;
    } else if (this.userPosition.position === 'Partner') {
      return true;
    } else {
      return false;
    }
  }

  public userName() {
    const userName = JSON.parse(sessionStorage.getItem('session-user-details'));
    return userName.fullName
  }

  public partnerID() {
    const userName = JSON.parse(sessionStorage.getItem('session-user-details'));
    return userName.partnerID
  }
}
