import * as ko from 'knockout';
import { MarkerModel } from './marker-model';
import { Sidebar } from './sidebar';
import { STYLES } from './globals';

class ViewModel {
    map: google.maps.Map;
    infoWindow: google.maps.InfoWindow;
    bounds: google.maps.LatLngBounds;
    private markerModel: KnockoutObservable<MarkerModel>;
    private sideBar: KnockoutObservable<any>;

    constructor() {
        this.map = new google.maps.Map(document.getElementById('map'),
            {
                center: { lat: -33.865143, lng: 151.209900 },
                zoom: 13,
                styles: STYLES,
                mapTypeControl: false
            });
        this.infoWindow = new google.maps.InfoWindow();
        this.bounds = new google.maps.LatLngBounds();

        this.sideBar = ko.observable (new Sidebar ());
        this.markerModel = ko.observable(new MarkerModel(this.map, this.bounds, this.infoWindow));
        //Sidebar.onLoad();
    }

}

export var viewModel = new ViewModel();
ko.applyBindings(viewModel);
