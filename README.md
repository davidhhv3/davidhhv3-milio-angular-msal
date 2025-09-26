# Angular 20 + MSAL (Microsoft Entra ID)

Este proyecto es una aplicación **Angular 20** (con módulos, no standalone) integrada con **MSAL** para autenticación contra **Microsoft Entra ID (Azure Active Directory)**.  
Permite iniciar sesión con cuentas Microsoft y consultar el perfil del usuario mediante **Microsoft Graph API**.

---

## Requisitos previos

- [Node.js](https://nodejs.org/) v18 o superior  
- [Angular CLI](https://angular.dev/tools/cli) v20  
- Una aplicación registrada en [Azure Portal](https://portal.azure.com) con:
  - `clientId`
  - `tenantId` (o authority)
  - `redirectUri` configurado como:  
    ```
    http://localhost:4200
    ```

---

## Instalación

Clonar el repositorio e instalar dependencias:

```bash
git clone https://github.com/davidhhv3/davidhhv3-milio-angular-msal.git
npm install
```

---

## Configuración de MSAL

En el archivo **`app.module.ts`**, modifica la configuración de MSAL con los valores de tu aplicación en Azure:

```ts
auth: {
  clientId: "TU_CLIENT_ID",
  authority: "https://login.microsoftonline.com/TU_TENANT_ID",
  redirectUri: "http://localhost:4200"
}
```

---

## Ejecución

Levantar el servidor de desarrollo y abrir el navegador automáticamente:

```bash
ng serve -o
```

La aplicación quedará disponible en:

👉 [http://localhost:4200](http://localhost:4200)
