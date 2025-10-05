
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
    this.msalBroadcastService.msalSubject$ //msalSubject$ objeto observable,emite eventos relacionados con la autenticación y adquisición de tokens
      .pipe(filter((msg: EventMessage) => msg.eventType === EventType.LOGIN_SUCCESS)) //activa el subscribe solo si obtiene un token exitosamente
      .subscribe((result: EventMessage) => {
        const payload = result.payload as AuthenticationResult; //obtiene datos del evento (account-usuario autenticado,idToken,ExpiresOn-fecha expiracion token)
        this.authService.instance.setActiveAccount(payload.account);//Aquí se está diciendo a MSAL cuál es la cuenta activa actual (útil cuando el usuario tiene múltiples cuentas, para que MSAL sepa cuál usar por defecto al hacer llamadas a Graph API o al obtener tokens.).
        this.setLoginDisplay();
      });

    // cada vez que cambia el estado de interacción
    this.msalBroadcastService.inProgress$//Observable que emite el estado actual de interacción con MSAL(Login en progreso,AcquireToken en progreso,None cuando no hay ninguna interacción activa)
      .pipe(filter(status => status === InteractionStatus.None))//Filtra los valores emitidos y solo deja pasar aquellos donde no hay ninguna interacción en curso
                                                                //Esto evita ejecutar código mientras MSAL está realizando un login o adquiriendo un token     
      .subscribe(() => {
        this.setLoginDisplay();
      });
  }

    setLoginDisplay() {
      this.loginDisplay = this.authService.instance.getAllAccounts().length > 0;
    }

}