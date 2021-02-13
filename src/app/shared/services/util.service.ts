import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class UtilService {

  constructor(
    public http: HttpClient
  ) { }

  private imageOrVideoFileTypes = [
    'application/ogg',
    'application/vnd.apple.mpegurl',
    'application/x-mpegURL',
    'image/apng',
    'image/bmp',
    'image/gif',
    'image/jpeg',
    'image/png',
    'image/svg+xml',
    'image/tiff',
    'image/webp',
    'image/x-icon',
  ];

  validateFile(file: File): boolean {
    return this.imageOrVideoFileTypes.includes(file.type);
  }

  sendEmail(email: any , subject: any , message: any ) {
    const url = 'https://us-central1-imsrf-dev.cloudfunctions.net/sendMail';
    const body: any = {
      // tslint:disable-next-line: object-literal-key-quotes
      'email' : email,
      // tslint:disable-next-line: object-literal-key-quotes
      'subject' : subject,
      // tslint:disable-next-line: object-literal-key-quotes
      'message' : message,
    };
    // tslint:disable-next-line: no-angle-bracket-type-assertion
    const output = <JSON>body;
    const httpOptions = {
      responseType: 'text' as 'json'
    };
    // tslint:disable-next-line: no-angle-bracket-type-assertion
    return this.http.post<any>(url , <JSON>output , httpOptions ).subscribe({
      error: error => console.error('There was an error!', error)
    });
  }

  sendBroadcastEmail(partnerID: any , subject: any , message: any ) {
    const url = 'https://us-central1-imsrf-dev.cloudfunctions.net/sendBroadcastEmail';
    // const url = 'http://localhost:5000/imsrf-dev/us-central1/sendBroadcastMail';
    const body: any = {
      // tslint:disable-next-line: object-literal-key-quotes
      'institution' : partnerID,
      // tslint:disable-next-line: object-literal-key-quotes
      'subject' : subject,
      // tslint:disable-next-line: object-literal-key-quotes
      'message' : message,
    };
    // tslint:disable-next-line: no-angle-bracket-type-assertion
    const output = <JSON>body;
    const httpOptions = {
      responseType: 'text' as 'json'
    };
    // tslint:disable-next-line: no-angle-bracket-type-assertion
    return this.http.post<any>(url , <JSON>output , httpOptions ).subscribe({
      error: error => console.error('There was an error!', error)
    });
  }
}
