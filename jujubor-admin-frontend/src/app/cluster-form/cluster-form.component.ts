import { Component } from '@angular/core';
import { ReactiveFormsModule, FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-cluster-form',
  standalone: true,
  imports: [ CommonModule, ReactiveFormsModule ],
  templateUrl: './cluster-form.component.html',
  styleUrl: './cluster-form.component.scss'
})
export class ClusterFormComponent {
  clusterForm: FormGroup;

  constructor(private fb: FormBuilder) {
    this.clusterForm = this.fb.group({
      clusters: this.fb.array([this.createCluster()])
    });
  }

  get clusters(): FormArray {
    return this.clusterForm.get('clusters') as FormArray;
  }

  createCluster(): FormGroup {
    return this.fb.group({
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
    this.clusters.push(this.createCluster());
  }

  removeCluster(index: number): void {
    if (this.clusters.length > 1) {
      this.clusters.removeAt(index);
    }
  }

  onSubmit(): void {
    if (this.clusterForm.valid) {
      console.log('Form Data:', this.clusterForm.value.clusters);
      // You can send this JSON to backend or use it to generate YAML
    } else {
      console.warn('Form is invalid!');
    }
  }

}
