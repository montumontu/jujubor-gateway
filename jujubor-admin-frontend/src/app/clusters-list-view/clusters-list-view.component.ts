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
  existingClusters: any;
  searchTerm: string = '';
  allClusters: any[] = []; // fetched or injected
  get filteredClusters() {
    console.log("filtered clusters");
    return this.existingClusters.filter((cluster: { clusterName: string; }) =>
      cluster.clusterName.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
  }
  constructor(private router: Router, private clusterService: ClusterService,) {
    
  }

  async ngOnInit() {
    // this.existingClusters = await this.clusterService.getClusters();
    // console.log(this.existingClusters, "this.existing clusters");
    this.clusterService.getClusters().subscribe({
      next: (data) => {
        this.existingClusters = data;
      },
      error: (err) => {
        console.error('Error loading clusters:', err);
      }
    });
  }


  onEditCluster(clusterPrefix: any) {
    this.router.navigate(['/cluster/edit', clusterPrefix]);
  }
  confirmDelete(cluster: any) {
    const userInput = prompt(`To confirm deletion, enter the Cluster ID: "${cluster.id}"`);
    console.log(userInput, "user input");
    console.log("cluster", cluster)
    if (userInput == cluster.id) {
      this.deleteCluster(cluster.prefix);
    } else {
      alert('Cluster ID did not match. Deletion cancelled.');
    }
  }
  
  deleteCluster(clusterPath: string) {
    // 🔧 Replace this with your actual delete service call
    this.clusterService.deleteCluster(clusterPath).subscribe({
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
