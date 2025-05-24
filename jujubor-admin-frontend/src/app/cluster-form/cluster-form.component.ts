import { Component } from '@angular/core';
import { ReactiveFormsModule, FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { ClusterService } from '../services/cluster.service';

@Component({
  selector: 'app-cluster-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './cluster-form.component.html',
  styleUrl: './cluster-form.component.scss'
})
export class ClusterFormComponent {
  clusterForm: FormGroup;
  errorMessage: String;
  mode: 'add' | 'edit' = 'add';
  clusterPrefix: string | null = null;
  existingClusters: any;
  uneditCluster: any;
  constructor(private fb: FormBuilder, private route: ActivatedRoute, private clusterService: ClusterService,) {
    this.errorMessage = "";
    this.clusterForm = this.fb.group({
      clusters: this.fb.array([this.createCluster()])
    });
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      this.clusterPrefix = params.get('prefix');
      this.mode = this.clusterPrefix ? 'edit' : 'add';
      console.log(this.mode);
      if (this.mode === 'edit') {
        this.loadClusterData(this.clusterPrefix);
      } else {
        // this.addCluster(); // at least one empty cluster to begin with
      }
    });
  }

  get clusters(): FormArray {
    return this.clusterForm.get('clusters') as FormArray;
  }

  createCluster(): FormGroup {
    return this.fb.group({
      orgId: "1",
      clusterName: ['', Validators.required],
      address: ['', Validators.required],
      port: [80, [Validators.required, Validators.min(1)]],
      prefix: ['/', Validators.required],
      useTLS: [false],
      cors: this.fb.group({
        enabled: [false],
        allowedOrigins: [''],
        allowedMethods: [''],
        allowedHeaders: [''],
        exposeHeaders: [''],
        allowCredentials: [false],
        maxAge: ['']
      })
    });
  }

  addCluster(): void {
    if (this.clusters.length >= 25) {
      console.warn('Maximum 25 clusters allowed.');
      // Optionally show UI error message
      this.errorMessage = 'You can only create up to 25 clusters.';
      return;
    }
    this.clusters.push(this.createCluster());
  }

  removeCluster(index: number): void {
    if (this.clusters.length > 1) {
      this.clusters.removeAt(index);
    }
  }

  async onSubmit(): Promise<void> {
    console.log(this.mode, "edit modes");
    if (this.mode === "edit") {
      const clusterResponse = await this.editCluster();
      return clusterResponse;
    }
    if (this.clusterForm.valid) {
      console.log('Form Data:', this.clusterForm.value.clusters);
      const clusterResponse = await fetch("https://wtqqnztspbtgk7cvp6r6oghbbm0obiss.lambda-url.ap-south-1.on.aws/", {
        method: "POST",
        body: JSON.stringify(this.clusterForm.value.clusters)
      });
      console.log(clusterResponse);
      // You can send this JSON to backend or use it to generate YAML
    } else {
      console.warn('Form is invalid!');
    }
  }

  loadClusterData(clusterPrefix: string | null) {
    console.log("cluster which needs to be loaded", clusterPrefix);
    this.clusterService.getClusters().subscribe({
      next: (data) => {
        this.existingClusters = data;
      },
      error: (err) => {
        console.error('Error loading clusters:', err);
      }
    });
    console.log( this.existingClusters);
    const cluster =  this.existingClusters.find((cluster: { prefix: string | null; }) => cluster.prefix === clusterPrefix);
    console.log("cluster loading");
    console.log("load cluster data", cluster);
    if (cluster) {
      const formGroup = this.fb.group({
        clusterName: [cluster.clusterName],
        address: [cluster.address],
        port: [cluster.port],
        prefix: [cluster.prefix],
        useTLS: [cluster.useTLS],
        cors: this.fb.group({
          enabled: [cluster.cors.enabled],
          allowedOrigins: [cluster.cors.allowedOrigins],
          allowedMethods: [cluster.cors.allowedMethods],
          allowedHeaders: [cluster.cors.allowedHeaders],
          exposeHeaders: [cluster.cors.exposeHeaders],
          allowCredentials: [cluster.cors.allowCredentials],
          maxAge: [cluster.cors.maxAge]
        })
      });

      const formArray = this.fb.array([formGroup]);
      this.clusterForm.setControl('clusters', formArray);
    } else {
      console.warn('Cluster not found for prefix:', clusterPrefix);
    }
  }

  async editCluster() {
    if (this.clusterForm.valid) {
      const updatedCluster = this.clusterForm.value.clusters[0];
      const prefix = updatedCluster.prefix;
  
      const cluster = this.existingClusters.find((c: { prefix: string | null }) => c.prefix === prefix);
  
      if (!cluster) {
        console.error("Original cluster not found");
        return;
      }
  
      const changedProperties = this.getChangedProperties(cluster, updatedCluster, ['prefix']);
  
      if (Object.keys(changedProperties).length === 0) {
        console.log("No changes detected.");
        return;
      }
  
      console.log('Changedd Properties:', changedProperties);
  
      const clusterResponse = await fetch(`https://wtqqnztspbtgk7cvp6r6oghbbm0obiss.lambda-url.ap-south-1.on.aws/${prefix}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          ...changedProperties
        }),
      });
  
      console.log("Server Response:", clusterResponse);
    }
  }
  

  getChangedProperties(original: { [key: string]: any }, updated: { [key: string]: any }, excludeKeys: string[] = []): { [key: string]: any } {
    const changes: { [key: string]: any } = {};
  
    Object.keys(updated).forEach(key => {
      if (!excludeKeys.includes(key) && updated[key] !== original[key]) {
        changes[key] = updated[key];
      }
    });
  
    return changes;
  }

}


