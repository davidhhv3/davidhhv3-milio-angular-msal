import { BrowserModule } from '@angular/platform-browser';
// Es un módulo de Angular necesario para que tu aplicación pueda correr en un navegador web.
//Internamente incluye cosas básicas como: *ngIf, *ngFor, etc.
//Soporte para renderizar componentes en el navegador.

import { NgModule } from '@angular/core';
//Es un decorador que le dice a Angular: Esto es un módulo, y aquí te paso la lista de componentes, directivas, pipes, servicios y otros módulos que forman parte de él”.
//Se aplica sobre una clase (por convención AppModule) y organiza tu aplicación.


import { AppRoutingModule } from './app-routing.module';
import { App } from './app';
import { Profile } from './profile/profile';
import { Home } from './home/home';


import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
//HTTP_INTERCEPTORS Es un “vigilante” que se ejecuta antes y después de cada petición HTTP de tu app.
//Te permite modificar la petición, la respuesta o manejar errores de forma centralizada.

import { IPublicClientApplication, PublicClientApplication, InteractionType, BrowserCacheLocation} from '@azure/msal-browser';
import { MsalGuard, MsalInterceptor, MsalBroadcastService, MsalInterceptorConfiguration, MsalModule, MsalService, MSAL_GUARD_CONFIG, MSAL_INSTANCE, MSAL_INTERCEPTOR_CONFIG, MsalGuardConfiguration, MsalRedirectComponent } from '@azure/msal-angular';

const isIE = window.navigator.userAgent.indexOf('MSIE ') > -1 || window.navigator.userAgent.indexOf('Trident/') > -1;
//Ese código es un detector de Internet Explorer (cualquier versión), usado para activar ajustes especiales, porque IE no soporta muchas de las APIs modernas que Angular/MSAL utilizan.

export function MSALInstanceFactory(): IPublicClientApplication {
  return new PublicClientApplication({
    auth: {       
      clientId: "3c3b85a4-06c4-464e-839e-db68c1232e88",  
      authority: "https://login.microsoftonline.com/e91f436a-ee20-45a8-97c2-98ec7d32fd04",   
      redirectUri: "http://localhost:4200", 
    },
    cache: {
      cacheLocation: BrowserCacheLocation.LocalStorage, //Indica dónde se guardan los tokens (localStorage en vez de sessionStorage).los tokens permanecen incluso al cerrar el navegador.
      storeAuthStateInCookie: isIE //Si el navegador es Internet Explorer (isIE = true), guarda también info en cookies para evitar errores de compatibilidad.
    }
  });
}
//Ese código crea y devuelve la configuración principal de MSAL para que tu aplicación Angular pueda autenticarse con Microsoft Entra ID.
//es la instancia que conecta tu aplicación con Microsoft Entra ID y gestiona dónde se almacenan los tokens.

export function MSALInterceptorConfigFactory(): MsalInterceptorConfiguration {
  const protectedResourceMap = new Map<string, Array<string>>();
  //protectedResourceMap.set('https://graph.microsoft.com/v1.0/me', ['user.read','Directory.Read.All']);
  protectedResourceMap.set('https://graph.microsoft.com/v1.0/me', ['user.read','RoleManagement.Read.All']);

  return {
    interactionType: InteractionType.Redirect,
    protectedResourceMap
  };
}
//Esa función configura al interceptor de MSAL para que, cuando tu aplicación haga una petición a la API de Microsoft Graph en la ruta https://graph.microsoft.com/v1.0/me, automáticamente adjunte en la 
//cabecera el token de acceso con el permiso user.read, lo que permite que la API devuelva la información básica del usuario autenticado usando el flujo de redirección.


export function MSALGuardConfigFactory(): MsalGuardConfiguration {
  return { 
    interactionType: InteractionType.Redirect,
    authRequest: {
      scopes: ['user.read']
    }
  };
}
//define la configuración del MSAL Guard, que es el mecanismo de Angular que protege rutas y decide cómo se pedirá al usuario que inicie sesión cuando intente entrar a una página restringida.
//al acceder a una ruta protegida el usuario será enviado a la página de login de Microsoft y, tras autenticarse, redirigido de nuevo a tu aplicación.
//en authRequest se definen los permisos o scopes que la aplicación solicita en ese momento;en este caso:
//user.read, que permite a la app leer el perfil básico del usuario a través de Microsoft Graph.


@NgModule({
  //@NgModule:sirve para organizar el código de tu aplicación en módulos.
  declarations: [
    App,
    Home,
    Profile
  ],
  //declarations: registra los componentes App, Home y Profile dentro de un módulo Angular para que se puedan usar dentro de la aplicación.

  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    MsalModule
  ],
  //imports indica qué otros módulos externos necesita tu aplicación para funcionar.


  providers: [
    //providers sirve para registrar servicios o clases especiales que el sistema de inyección de dependencias podrá usar en toda la aplicación.
    {
      provide: HTTP_INTERCEPTORS, //Le dice a Angular: “quiero añadir un interceptor HTTP”. HTTP_INTERCEPTORS es un token especial de Angular que agrupa todos los interceptores.
      useClass: MsalInterceptor, //Define qué clase se va a usar como interceptor. En este caso, MsalInterceptor es el que viene con MSAL y se encarga de añadir el token de acceso en 
                                 // las cabeceras de las peticiones HTTP cuando llamas a APIs protegidas
      multi: true //Indica que pueden existir múltiples interceptores registrados al mismo tiempo
    },
    //regfistra un interceptor HTTP
    //ese código registra el MsalInterceptor como un interceptor HTTP global. Así, cada vez que tu aplicación haga una petición a una API protegida,el interceptor añadirá automáticamente el token de
    //autenticación en la cabecera,sin que tú tengas que preocuparte de hacerlo manualmente.

    {
      provide: MSAL_INSTANCE,
      useFactory: MSALInstanceFactory
    },

    {
      provide: MSAL_GUARD_CONFIG,
      useFactory: MSALGuardConfigFactory
    },
    {
      provide: MSAL_INTERCEPTOR_CONFIG,
      useFactory: MSALInterceptorConfigFactory
    },
    MsalService,
    MsalGuard,
    MsalBroadcastService
  ],

  bootstrap: [App, MsalRedirectComponent]//define qué componentes se arrancan automáticamente cuando inicia la aplicación Angular.
  //<app-root></app-root> = App
  //MsalRedirectComponent: Es un componente especial que trae MSAL Angular. Su función es procesar la respuesta del login por redirección.Es un componente especial que trae MSAL Angular. 
  //Su función es procesar la respuesta del login por redirección.Cuando el usuario se autentica en Microsoft Entra ID y vuelve a tu app con los tokens en la URL, este componente se encarga de leerlos, 
  //guardarlos en el almacenamiento (localStorage o sessionStorage) y dejar lista la sesión del usuario.
  //<app-redirect></app-redirect> = MsalRedirectComponent

})
export class AppModule { }