import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'home', // Nu start de app direct op je mooie landingspagina
    pathMatch: 'full'
  },
  {
    path: 'home',
    loadComponent: () => import('./pages/home/home.page').then(m => m.HomePage)
  },
  {
    path: 'patient',
    loadComponent: () => import('./features/tab1/tab1.page').then(m => m.Tab1Page)
  },
  {
    path: 'oxygen-gas',
    loadComponent: () => import('./features/tab2/tab2.page').then(m => m.Tab2Page)
  },
  {
    path: 'rox',
    loadComponent: () => import('./features/rox/rox.page').then(m => m.RoxPage)
  },
  {
    path: 'ventilatie',
    loadComponent: () => import('./features/tab3/tab3.page').then(m => m.Tab3Page)
  },
  {
    path: 'nierfunctie',
    loadComponent: () => import('./features/renal/nierfunctie.page').then(m => m.NierfunctiePage)
  },
  {
    path: 'cvvhd',
    loadComponent: () => import('./features/renal/cvvhd.page').then(m => m.CVVHDPage)
  },
  {
    path: 'hemodynamiek',
    loadComponent: () => import('./features/tab5/tab5.page').then(m => m.Tab5Page) // Corrected path
  },
  {
    path: 'medicatie',
    loadComponent: () => import('./features/tab4/tab4.page').then(m => m.Tab4Page)
  },
  {
    path: 'hamilton',
    loadComponent: () => import('./features/tab6/tab6.page').then(m => m.Tab6Page)
  },
  {
    path: 'info',
    loadComponent: () => import('./features/info/info.page').then(m => m.InfoPage)
  },
  {
    path: 'shift-log',
    loadComponent: () => import('./features/shift-log/shift-log.page').then( m => m.ShiftLogPage)
  },
  {
    path: 'reanimatie',
    loadComponent: () => import('./features/resuscitation/resuscitation.component').then(m => m.ResuscitationComponent)
  },

];
