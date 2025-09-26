// Required for Angular
import { NgModule } from '@angular/core';

// Required for the Angular routing service
import { Routes, RouterModule } from '@angular/router';

// Required for the "Profile" page
import { Profile } from './profile/profile';

// Required for the "Home" page
import { Home } from './home/home';

// MsalGuard is required to protect routes and require authentication before accessing protected routes
import { MsalGuard } from '@azure/msal-angular';

// Define the possible routes
// Specify MsalGuard on routes to be protected
// '**' denotes a wild card
const routes: Routes = [
  {
    path: 'profile',
    component: Profile,
    canActivate: [
      MsalGuard
    ]
  },
  {
    path: '**',
    component: Home
  }
];

// Create an NgModule that contains all the directives for the routes specified above
@NgModule({
  imports: [RouterModule.forRoot(routes, {
    useHash: true
  })],
  exports: [RouterModule]
})
export class AppRoutingModule { }