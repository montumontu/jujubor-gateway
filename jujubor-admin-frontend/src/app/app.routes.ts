import { Routes } from '@angular/router';
import { ClusterFormComponent } from './cluster-form/cluster-form.component';


export const routes: Routes = [
    {
        path: '',
        redirectTo: 'form',
        pathMatch: 'full'
      },
      {
        path: 'form',
        component: ClusterFormComponent
      }
];
