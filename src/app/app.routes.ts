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
    loadComponent: () => import('./tab1/tab1.page').then(m => m.Tab1Page)
  },
  {
    path: 'oxygen-gas',
    loadComponent: () => import('./tab2/tab2.page').then(m => m.Tab2Page)
  },
  {
    path: 'rox',
    loadComponent: () => import('./rox/rox.page').then(m => m.RoxPage)
  },
  {
    path: 'ventilatie',
    loadComponent: () => import('./tab3/tab3.page').then(m => m.Tab3Page)
  },
  {
    path: 'nierfunctie',
    loadComponent: () => import('./renal/nierfunctie.page').then(m => m.NierfunctiePage)
  },
  {
    path: 'cvvhd',
    loadComponent: () => import('./renal/cvvhd.page').then(m => m.CVVHDPage)
  },
  {
    path: 'hemodynamiek',
    loadComponent: () => import('./tab4/tab4.page').then(m => m.Tab4Page)
  },
  {
    path: 'medicatie',
    loadComponent: () => import('./tab5/tab5.page').then(m => m.Tab5Page)
  },
  {
    path: 'hamilton',
    loadComponent: () => import('./tab6/tab6.page').then(m => m.Tab6Page)
  },
  {
    path: 'info',
    loadComponent: () => import('./pages/info/info.page').then(m => m.InfoPage)
  }
];
