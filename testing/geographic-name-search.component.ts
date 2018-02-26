import {
  AfterViewInit,
  Component,
  ElementRef,
  ViewChild
} from '@angular/core';

import {
  Headers,
  Jsonp,
  Response,
  URLSearchParams
} from '@angular/http';
import {
  MapService,
  SearchResult,
  SearchZoomComponent
} from 'revolsys-angular-leaflet';

@Component({
  selector: 'app-geographic-name-search',
  template: `<leaflet-search-zoom label="Geographic Name" style="width: 300px; display: flex"></leaflet-search-zoom>`
})
export class GeographicNameSearchComponent implements AfterViewInit {
  @ViewChild(SearchZoomComponent)
  searchComponent: SearchZoomComponent;


  public query: string;

  public constructor(
    private http: Jsonp
  ) {
  }

  ngAfterViewInit() {
    if (this.searchComponent) {
      this.searchComponent.searchFunction = (query) => this.search(query);
    }
  }

  search(query): Promise<SearchResult[]> {
    const params = new URLSearchParams();
    params.set('name', query);
    params.set('minScore', '0.7');
    params.set('itemsPerPage', '10');
    params.set('outputSRS', '4326');
    params.set('embed', '0');
    params.set('outputStyle', 'detail');
    params.set('outputFormat', 'jsonx');
    params.set('callback', 'JSONP_CALLBACK');
    return this.http.get(
      'https://apps.gov.bc.ca/pub/bcgnws/names/soundlike',
      {search: params}
    ).toPromise().then(response => {
      const matches: SearchResult[] = [];
      const found = false;
      const json = response.json();
      const features = json.features;
      if (features) {
        for (const feature of features) {
          const props = feature.properties;
          const name = props.name;
          let label = name;
          let featureType = props.featureType;
          if (featureType) {
            const parenStartIndex = featureType.indexOf('(');
            const parenEndIndex = featureType.indexOf(')');
            if (parenStartIndex !== -1 && parenEndIndex > parenStartIndex) {
              featureType = featureType.substring(0, parenStartIndex) + featureType.substring(parenEndIndex + 1);
            }
            label += ' (' + featureType + ')';
          }
          label += '  ' + props.feature.relativeLocation;
          matches.push(new SearchResult(
            props['uri'],
            label,
            props['featurePoint']
          ));
        }
      }
      return matches;
    });
  }
}
