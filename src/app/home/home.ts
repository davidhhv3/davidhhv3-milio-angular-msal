// Required for Angular
import { Component, OnInit } from '@angular/core';

// Required for MSAL
import { MsalBroadcastService, MsalService } from '@azure/msal-angular';

// Required for Angular multi-browser support
import { EventMessage, EventType, AuthenticationResult ,InteractionStatus } from '@azure/msal-browser';

// Required for RJXS observables
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-home',
  templateUrl: './home.html',
  standalone: false
})
export class Home implements OnInit {

  loginDisplay = false;

  constructor(
    private authService: MsalService,
    private msalBroadcastService: MsalBroadcastService
  ) { }

  ngOnInit(): void {
    // cuando el login sea exitoso
    this.msalBroadcastService.msalSubject$
      .pipe(filter((msg: EventMessage) => msg.eventType === EventType.LOGIN_SUCCESS))
      .subscribe((result: EventMessage) => {
        const payload = result.payload as AuthenticationResult;
        this.authService.instance.setActiveAccount(payload.account);
        this.setLoginDisplay();
      });

    // cada vez que cambia el estado de interacción
    this.msalBroadcastService.inProgress$
      .pipe(filter(status => status === InteractionStatus.None))
      .subscribe(() => {
        this.setLoginDisplay();
      });
  }

    setLoginDisplay() {
    this.loginDisplay = this.authService.instance.getAllAccounts().length > 0;
  }

}