import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable, tap } from 'rxjs';
import { of } from 'rxjs';


export interface Cluster {

    id: string;
    clusterName: string;
    address: string;
    port: number;
    prefix: string;
    useTLS: boolean;
    cors: {
        enabled: boolean;
        allowedOrigins?: string;
        allowedMethods?: string;
        allowedHeaders?: string;
        exposeHeaders?: string;
        allowCredentials?: boolean;
        maxAge?: number;
    };
  
}

@Injectable({
    providedIn: 'root',
})
export class ClusterService {
    private baseUrl = 'https://wtqqnztspbtgk7cvp6r6oghbbm0obiss.lambda-url.ap-south-1.on.aws'; // Adjust base URL as needed
    // private dummyClusters = [ {
    //     id:1234,
    //     clusterName: "pigeon Cluster",
    //     address: "polite.com",
    //     port: "9090",
    //     prefix: "pigeon",
    //     useTLS: "Yes",
    //     clusterId: "01e20e4d-b519-4552-b655-33d90berb0e6",
    //     cors: {
    //       enabled: true,
    //       allowedOrigins: ['www.google.com'],
    //       allowedMethods: ['GET'],
    //       allowedHeaders: ['Authorization'],
    //       exposeHeaders: "True",
    //       allowCredentials: "True",
    //       maxAge: false,
    
    //     }
    
    //   }, {
    //     id: 1235,
    //     clusterName: "Yes Cluster",
    //     address: "polite.com",
    //     port: "9090",
    //     prefix: "yes",
    //     useTLS: "Yes",
    //     clusterId: "01e20e4d-b519-4552-b666-33d90berb0e6",
    //     cors: {
    //       enabled: true,
    //       allowedOrigins: ['www.google.com'],
    //       allowedMethods: ['GET'],
    //       allowedHeaders: ['Authorization'],
    //       exposeHeaders: "True",
    //       allowCredentials: "True",
    //       maxAge: false,
    
    //     }
    
    //   }, {
    //     id: 1236,
    //     clusterName: "peacock Cluster",
    //     address: "polite.com",
    //     port: "9090",
    //     prefix: "peacock",
    //     useTLS: "Yes",
    //     orgId: "1",
    //     clusterId: "01e20e4d-b519-4552-b677-33d90berb0e6",
    //     cors: {
    //       enabled: true,
    //       allowedOrigins: ['www.google.com'],
    //       allowedMethods: ['GET'],
    //       allowedHeaders: ['Authorization'],
    //       exposeHeaders: "True",
    //       allowCredentials: "True",
    //       maxAge: false,
    
    //     }
    
    //   }, 
    //   {
    //     id: 1237,
    //     clusterName: "Ashoka Cluster",
    //     address: "polite.com",
    //     port: "9090",
    //     prefix: "ashoka",
    //     useTLS: "Yes",
    //     clusterId: "01e20e4d-b519-4552-b688-33d90berb0e6",
    //     cors: {
    //       enabled: true,
    //       allowedOrigins: ['www.google.com'],
    //       allowedMethods: ['GET'],
    //       allowedHeaders: ['Authorization'],
    //       exposeHeaders: "True",
    //       allowCredentials: "True",
    //       maxAge: false,
    
    //     }
    //   }, 
    //   {
    //     id: "123",
    //     clusterName: "Dummy Cluster",
    //     address: "polite.com",
    //     port: "9090",
    //     prefix: "dummmy",
    //     useTLS: "Yes",
    //     "orgId": "1",
    //     clusterId: "01e20e4d-b519-4552-b699-33d90berb0e6",
    //     cors: {
    //       enabled: true,
    //       allowedOrigins: ['www.google.com'],
    //       allowedMethods: ['GET'],
    //       allowedHeaders: ['Authorization'],
    //       exposeHeaders: "True",
    //       allowCredentials: "True",
    //       maxAge: false,
    
    //     }
    //   },
    // ];
    private clusters: any;

    constructor(private http: HttpClient) {
     }

    /**
     * Get list of all clusters
     */
    getClusters(): Observable<Cluster[]> {
      console.log("in get clusters");
      if (this.clusters) {
        // Return already loaded data as Observable
        return of(this.clusters);
      } 
      return this.http.get<{ Items: Cluster[] }>(`https://wtqqnztspbtgk7cvp6r6oghbbm0obiss.lambda-url.ap-south-1.on.aws`).pipe(
        map((data: { Items: any; }) => data.Items),                  // Extract array from response
        tap(items => this.clusters = items)       // Optionally cache it
      );
    }

    /**
     * Get a specific cluster by ID
     */
    getClusterById(id: string): Observable<Cluster> {
        return this.http.get<Cluster>(`${this.baseUrl}/${id}`);
    }

    /**
     * Add a new cluster
     */
    addCluster(clusterData: any): Observable<any> {
        return this.http.post(`${this.baseUrl}/add`, clusterData);
    }

    /**
     * Update a cluster by ID
     */
    updateCluster(id: string, clusterData: any): Observable<any> {
        return this.http.put(`${this.baseUrl}/edit/${id}`, clusterData);
    }

    /**
     * Delete a cluster by ID
     */
    deleteCluster(clusterPath: string): Observable<any> {
        return this.http.patch(`${this.baseUrl}/${clusterPath}`, { deleted : true});
    }
}
