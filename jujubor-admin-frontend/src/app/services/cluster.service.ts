import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
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
    private baseUrl = '/api/cluster'; // Adjust base URL as needed

    constructor(private http: HttpClient) { }

    /**
     * Get list of all clusters
     */
    getClusters(): Observable<Cluster[]> {
        return this.http.get<Cluster[]>(`${this.baseUrl}/list`);
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
    deleteCluster(id: string): Observable<any> {
        // return this.http.delete(`${this.baseUrl}/${id}`);
        console.log(`Simulated delete of cluster with id: ${id}`);

        // Return a fake success response
        return of({ success: true, message: `Cluster ${id} deleted.` });
    }
}
