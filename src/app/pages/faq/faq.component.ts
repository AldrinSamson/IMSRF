import { Component, OnInit } from '@angular/core';
import { UserService } from '@shared';

@Component({
  selector: 'app-faq',
  templateUrl: './faq.component.html',
  styleUrls: ['./faq.component.scss']
})
export class FaqComponent implements OnInit {

  userDetails
  route = '/login'

  constructor(
    private readonly userService: UserService
  ) {}

  ngOnInit(): void {

    this.userDetails = JSON.parse(sessionStorage.getItem('session-user-details'));
    if(this.userDetails !== null){
      if( this.userDetails.position === 'Partner') {
        this.route = '/partner'
      }else{
        this.route = '/main'
      }
    }
    
  }

}
