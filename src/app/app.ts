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
    //@Inject(MSAL_GUARD_CONFIG) private msalGuardConfig: MsalGuardConfiguration,//Aquí se inyecta el objeto de configuración del MsalGuard (el que configuraste con MSALGuardConfigFactory).
    private authService: MsalService,
    private msalBroadcastService: MsalBroadcastService
  ) { }


  ngOnInit(): void {
    this.msalBroadcastService.inProgress$ //Observable que emite el estado actual de interacción con MSAL(Login en progreso,AcquireToken en progreso,None cuando no hay ninguna interacción activa)
      .pipe( //se usa para transformar o filtrar los valores del Observable antes de que lleguen al subscribe.
          filter((status: InteractionStatus) => status === InteractionStatus.None), //Filtra los valores emitidos y solo deja pasar aquellos donde no hay ninguna interacción en curso
                                                                                    //Esto evita ejecutar código mientras MSAL está realizando un login o adquiriendo un token
          takeUntil(this._destroying$)//asegura que la suscripción se cancele automáticamente cuando this._destroying$(Subject que emite cuando el componente se destruye,ngOnDestroy) emita un valor.
      )
      .subscribe(() => { //Cuando el Observable emite (y pasa el filtro), se ejecuta esta función.
        this.setLoginDisplay();
      });
      //Ese código se suscribe al estado de MSAL y espera hasta que no haya ninguna operación de autenticación en curso. Cuando todo termina, 
      //ejecuta el método setLoginDisplay() para actualizar la pantalla y reflejar si el usuario está logueado o no.
      
      
      this.msalBroadcastService.msalSubject$ //msalSubject$ objeto observable,emitir eventos relacionados con la autenticación y adquisición de tokens .ejem:
// LOGIN_SUCCESS: el usuario se autenticó correctamente.
// ACQUIRE_TOKEN_SUCCESS: se obtuvo un token con éxito.
// LOGIN_FAILURE: fallo al iniciar sesión.
// ACQUIRE_TOKEN_FAILURE: fallo al adquirir un token.
// LOGOUT_SUCCESS o LOGOUT_FAILURE.

        .pipe(
          filter((msg: EventMessage) => msg.eventType === EventType.ACQUIRE_TOKEN_SUCCESS) //activa el subscribe solo si btiene un token exitosamente
                                                                                           //errores de login, logout, o token expirado se descartan y no activan el .subscribe.
        )
        .subscribe(msg => {          
          this.tokenExpiration = (msg.payload as any).expiresOn; // Guardamos la fecha de expiración del token
          
          localStorage.setItem('tokenExpiration', this.tokenExpiration);// Almacenamos la fecha en localStorage

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
//Notifica a los observables que deben completar su trabajo y desuscribirse