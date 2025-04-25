import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'filterClusters',
  standalone: true
})
export class FilterClustersPipe implements PipeTransform {

  transform(clusters: any[], searchTerm: string): any[] {
    if (!clusters) return [];
    if (!searchTerm) return clusters;

    searchTerm = searchTerm.toLowerCase();

    return clusters.filter(cluster =>
      cluster.clusterName?.toLowerCase().includes(searchTerm)
    );
  }

}
