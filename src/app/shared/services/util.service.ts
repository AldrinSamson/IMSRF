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

  sendEmail(email: any , subject: any , template: String , replacements: JSON ) {
    const url = 'https://us-central1-imsrf-dev.cloudfunctions.net/sendMail';
    const body: any = {
      // tslint:disable-next-line: object-literal-key-quotes
      'email' : email,
       // tslint:disable-next-line: object-literal-key-quotes
      'subject' : subject,
      // tslint:disable-next-line: object-literal-key-quotes
      'template' : template,
      // tslint:disable-next-line: object-literal-key-quotes
      'replacements' : replacements,
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

  sendBroadcastToPositionEmail(subject: any , template: String , replacements: any , position: String) {
    const url = 'https://us-central1-imsrf-dev.cloudfunctions.net/broadcastToPositionEmail';
    // const url = 'http://localhost:5001/imsrf-dev/us-central1/broadcastToPositionEmail';
    const body: any = {
       // tslint:disable-next-line: object-literal-key-quotes
      'subject' : subject,
      // tslint:disable-next-line: object-literal-key-quotes
      'template' : template,
      // tslint:disable-next-line: object-literal-key-quotes
      'replacements' : replacements,
      // tslint:disable-next-line: object-literal-key-quotes
      'position' : position,
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

  sendBroadcastToPartnerEmail(subject: any , template: String , replacements: any , partnerID: String) {
    const url = 'https://us-central1-imsrf-dev.cloudfunctions.net/broadcastToPartnerEmail';
    // const url = 'http://localhost:5001/imsrf-dev/us-central1/broadcastToPositionEmail';
    const body: any = {
       // tslint:disable-next-line: object-literal-key-quotes
      'subject' : subject,
      // tslint:disable-next-line: object-literal-key-quotes
      'template' : template,
      // tslint:disable-next-line: object-literal-key-quotes
      'replacements' : replacements,
      // tslint:disable-next-line: object-literal-key-quotes
      'partnerID' : partnerID,
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
