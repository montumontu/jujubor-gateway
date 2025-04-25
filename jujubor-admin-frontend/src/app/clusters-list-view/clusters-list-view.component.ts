import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FilterClustersPipe } from '../filter-clusters.pipe';
import { Router } from '@angular/router';
import { RouterLink } from '@angular/router';
import { ClusterService } from '../services/cluster.service';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { importProvidersFrom } from '@angular/core';



@Component({
  selector: 'app-clusters-view',
  standalone: true,
  imports: [CommonModule, FormsModule, FilterClustersPipe, RouterLink],
  templateUrl: './clusters-list-view.component.html',
  styleUrl: './clusters-list-view.component.scss'
})
export class ClustersListViewComponent {
  existingClusters = [{
    id: "123",
    clusterName: "Dummy Cluster",
    address: "polite.com",
    port: "9090",
    prefix: "https",
    useTLS: "Yes",
    cors: {
      enabled: true,
      allowedOrigins: ['www.google.com'],
      allowedMethods: ['GET'],
      allowedHeaders: ['Authorization'],
      exposeHeaders: "True",
      allowCredentials: "True",
      maxAge: false,

    }

  }, {
    id:123,
    clusterName: "pigeon Cluster",
    address: "polite.com",
    port: "9090",
    prefix: "https",
    useTLS: "Yes",
    cors: {
      enabled: true,
      allowedOrigins: ['www.google.com'],
      allowedMethods: ['GET'],
      allowedHeaders: ['Authorization'],
      exposeHeaders: "True",
      allowCredentials: "True",
      maxAge: false,

    }

  }, {
    id: 123,
    clusterName: "Yes Cluster",
    address: "polite.com",
    port: "9090",
    prefix: "https",
    useTLS: "Yes",
    cors: {
      enabled: true,
      allowedOrigins: ['www.google.com'],
      allowedMethods: ['GET'],
      allowedHeaders: ['Authorization'],
      exposeHeaders: "True",
      allowCredentials: "True",
      maxAge: false,

    }

  }, {
    id: 123,
    clusterName: "peacock Cluster",
    address: "polite.com",
    port: "9090",
    prefix: "https",
    useTLS: "Yes",
    cors: {
      enabled: true,
      allowedOrigins: ['www.google.com'],
      allowedMethods: ['GET'],
      allowedHeaders: ['Authorization'],
      exposeHeaders: "True",
      allowCredentials: "True",
      maxAge: false,

    }

  }, 
  {
    id: 123,
    clusterName: "Ashoka Cluster",
    address: "polite.com",
    port: "9090",
    prefix: "https",
    useTLS: "Yes",
    cors: {
      enabled: true,
      allowedOrigins: ['www.google.com'],
      allowedMethods: ['GET'],
      allowedHeaders: ['Authorization'],
      exposeHeaders: "True",
      allowCredentials: "True",
      maxAge: false,

    }
  }, 
];

  searchTerm: string = '';
  allClusters: any[] = []; // fetched or injected
  get filteredClusters() {
    console.log("filtered clusters");
    return this.existingClusters.filter(cluster =>
      cluster.clusterName.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
  }
  constructor(private router: Router, private clusterService: ClusterService,) {

  }

  onEditCluster(clusterId: any) {
    this.router.navigate(['/cluster/edit', clusterId]);
  }
  confirmDelete(cluster: any) {
    const userInput = prompt(`To confirm deletion, enter the Cluster ID: "${cluster.id}"`);
  
    if (userInput === cluster.id) {
      this.deleteCluster(cluster.id);
    } else {
      alert('Cluster ID did not match. Deletion cancelled.');
    }
  }
  
  deleteCluster(clusterId: string) {
    // 🔧 Replace this with your actual delete service call
    this.clusterService.deleteCluster(clusterId).subscribe({
      next: () => {
        console.log("cluster deleted successfully");
        // alert('Cluster deleted successfully!');
        // this.fetchClusters(); // Refresh list
      },
      error: (err) => {
        console.error('Delete failed:', err);
        alert('Failed to delete cluster.');
      }
    });
  }
  
}
