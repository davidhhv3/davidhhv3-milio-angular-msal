// Required for Angular
import { Component, OnInit } from '@angular/core';

// Required for the HTTP GET request to Graph
import { HttpClient } from '@angular/common/http';

type ProfileType = {
  roles?: string[]; 
  businessPhones?: string,
  displayName?: string,
  givenName?: string,
  jobTitle?: string,
  mail?: string,
  mobilePhone?: string,
  officeLocation?: string,
  preferredLanguage?: string,
  surname?: string,
  userPrincipalName?: string,
  id?: string
}

@Component({
  selector: 'app-profile',
  templateUrl: './profile.html',
  standalone: false
})
export class Profile implements OnInit {
  profile!: ProfileType; 

  constructor(
    private http: HttpClient
  ) { }

  // When the page loads, perform an HTTP GET request from the Graph /me endpoint
  ngOnInit() {
  // this.http.get<ProfileType>('https://graph.microsoft.com/v1.0/me')
  //   .subscribe(profile => {
  //     this.profile = profile;
  //   });

  //grupos y roles
  // this.http.get('https://graph.microsoft.com/v1.0/me/memberOf')
  //   .subscribe(res => {
  //     console.log(res);
  //   });   
  
  this.http.get<ProfileType>('https://graph.microsoft.com/v1.0/me')
    .subscribe(profile => {
      this.profile = profile;

      //traemos roles
      this.http.get<{ value: any[] }>('https://graph.microsoft.com/v1.0/me/memberOf')
        .subscribe(res => {
          const roleNames = res.value
            .filter(item => item['@odata.type'] === '#microsoft.graph.directoryRole')
            .map(item => item.displayName);

          this.profile.roles = roleNames;          
        });
    });
  }
}