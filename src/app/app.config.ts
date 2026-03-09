import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { provideAuth, getAuth } from '@angular/fire/auth';
import { provideFirestore, getFirestore } from '@angular/fire/firestore';
import { environment } from '../environments/environment';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideFirebaseApp(() => initializeApp(environment.firebase)),
    provideBrowserGlobalErrorListeners(),
    provideAuth(() => getAuth()),
    provideFirestore(() => getFirestore()),  // ✅ Correct Firestore provider
    provideRouter(routes)
  ]
};