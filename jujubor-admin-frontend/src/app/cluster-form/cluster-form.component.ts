import { Component } from '@angular/core';
import { ReactiveFormsModule, FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';

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
  clusterId: string | null = null;
  existingClusters = [{
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
  }];
  constructor(private fb: FormBuilder, private route: ActivatedRoute) {
    this.errorMessage = "";
    this.clusterForm = this.fb.group({
      clusters: this.fb.array([this.createCluster()])
    });
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      this.clusterId = params.get('id');
      this.mode = this.clusterId ? 'edit' : 'add';

      if (this.mode === 'edit') {
        this.loadClusterData(this.clusterId);
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

  loadClusterData(id: string | null) {
    // 👇 Replace this with actual API call
    const clusterDataFromDB = this.existingClusters; // get array of clusters

    const formGroups = clusterDataFromDB.map((cluster: { clusterName: any; address: any; port: any; prefix: any; useTLS: any; cors: { enabled: any; allowedOrigins: any; allowedMethods: any; allowedHeaders: any; exposeHeaders: any; allowCredentials: any; maxAge: any; }; }) => this.fb.group({
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
    }));

    const formArray = this.fb.array(formGroups);
    this.clusterForm.setControl('clusters', formArray);
  }

}
