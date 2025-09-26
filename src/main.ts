import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
// Aquí se está importando la plataforma para navegadores web con compilación JIT (Just-In-Time).
// En pocas palabras: le dice a Angular: “ejecútate en un navegador”

import { AppModule } from './app/app.module';
// Qué componentes existen (AppComponent, otros).
// Qué librerías externas se usan (FormsModule, HttpClientModule, etc.).
// Qué servicio se provee.

platformBrowserDynamic().bootstrapModule(AppModule)
  .catch(err => console.error(err));
//   Agarrar tu AppModule → que es como el plano principal de la aplicación.
// Arrancar Angular en el navegador.
// Mostrar el componente raíz (generalmente <app-root>) dentro del index.html.

  