// Required for Angular
import { Component, OnInit, Inject, OnDestroy } from '@angular/core';

// Required for MSAL
import { MsalService, MsalBroadcastService, MSAL_GUARD_CONFIG, MsalGuardConfiguration } from '@azure/msal-angular';
import { EventMessage, EventType, InteractionStatus, RedirectRequest } from '@azure/msal-browser';

// Required for RJXS
import { Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  standalone: false
})
export class App implements OnInit, OnDestroy {
  title = 'Angular - MSAL Example';
  loginDisplay = false;
  tokenExpiration: string = '';
  private readonly _destroying$ = new Subject<void>();

  constructor(
    @Inject(MSAL_GUARD_CONFIG) private msalGuardConfig: MsalGuardConfiguration,//Aquí se inyecta el objeto de configuración del MsalGuard (el que configuraste con MSALGuardConfigFactory).
    private authService: MsalService,
    private msalBroadcastService: MsalBroadcastService
  ) { }


  ngOnInit(): void {
    this.msalBroadcastService.inProgress$
        .pipe(
        filter((status: InteractionStatus) => status === InteractionStatus.None),
        takeUntil(this._destroying$)
      )
      .subscribe(() => {
        this.setLoginDisplay();
      });
      //Ese código se suscribe al estado de MSAL y espera hasta que no haya ninguna operación de autenticación en curso. Cuando todo termina, 
      //ejecuta el método setLoginDisplay() para actualizar la pantalla y reflejar si el usuario está logueado o no.
      
      this.msalBroadcastService.msalSubject$.pipe(filter((msg: EventMessage) => msg.eventType === EventType.ACQUIRE_TOKEN_SUCCESS)).subscribe(msg => {
      this.tokenExpiration=  (msg.payload as any).expiresOn;
      localStorage.setItem('tokenExpiration', this.tokenExpiration);
      //Ese código escucha los eventos de MSAL y, cuando se adquiere correctamente un token (ACQUIRE_TOKEN_SUCCESS), 
      //guarda la fecha de expiración del token en la variable tokenExpiration y también en el localStorage para poder consultarla más tarde
    });
  }
 
  setLoginDisplay() {
    this.loginDisplay = this.authService.instance.getAllAccounts().length > 0;
  }
  //revisa si hay algún usuario autenticado y ajusta la interfaz para mostrar u ocultar elementos de login o perfil según corresponda.
 
  login() { 
       this.authService.loginRedirect();
  }

  logout() {
    this.authService.logoutRedirect(); //desconecta al usuario, elimina los tokens y lo devuelve al inicio de tu aplicación mediante una redirección al login.
  }

  ngOnDestroy(): void {
    this._destroying$.next(undefined);
    this._destroying$.complete();
  }
}