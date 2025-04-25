import { Routes } from '@angular/router';
import { ClusterFormComponent } from './cluster-form/cluster-form.component';
import { ClustersListViewComponent } from './clusters-list-view/clusters-list-view.component';


export const routes: Routes = [
    {
        path: '',
        redirectTo: 'cluster/list',
        pathMatch: 'full'
      },
      {
        path: 'cluster/add',
        component: ClusterFormComponent
      },
      {
        path: 'cluster/list',
        component: ClustersListViewComponent
      },
      {
        path: 'cluster/edit/:id',
        component: ClusterFormComponent
      },
];
