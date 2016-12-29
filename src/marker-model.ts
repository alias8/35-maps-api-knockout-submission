import * as $ from 'jquery';
import * as ko from 'knockout';
import { StreetViewService } from './streetview-service';
import { YelpService } from './yelp-service';
import { viewModel } from './viewmodel';
import { LocationsService, Location } from './locations-service';

/**
 * Class for holding the ko observables
 */
export class MarkerModel {
    private locationsList: Marker[] = [];
    private filterWord: KnockoutObservable<any>;
    private readonly filteredLocationsList: KnockoutObservable<Marker[]>;
    private locationsService: Promise<any>;
    private unmodifiedLocations: Location[];
    private loading: KnockoutObservable<boolean>;

    constructor(private map: google.maps.Map, private bounds: google.maps.LatLngBounds, private infoWindow: google.maps.InfoWindow) {
        this.loading = ko.observable(true);
        this.filterWord = ko.observable('').extend({ notify: 'always' });
        this.filteredLocationsList = ko.pureComputed (() => {
                var re = new RegExp (this.filterWord (), 'i');
                var filtered = this.locationsList
                    .filter (marker => {
                        var match = re.test (marker.getTitle ());
                        if (match) {
                            //marker.setMap(map);
                            marker.setVisible(true);
                        } else {
                            //marker.setMap(null);
                            marker.setVisible(false);
                        }
                        return match;
                    });
                return filtered;
            },
            this);

        this.getLocations();
        /**
         * Wait for locationsService promise to be fulfilled
         */
        Promise.all([this.locationsService])
            .then(() => {
                this.locationsList = this.initBuildList(this.unmodifiedLocations);
                this.filterWord('');
                this.loading (false);
                /**
                 * Begin prefetching of Yelp data since the calls take a few seconds.
                 * Save the fetched data for display when the marker is clicked
                 */
                this.locationsList.forEach((marker, index) => {
                    marker.fetchYelp();
                    marker.fetchStreetView();
                });
            });
    }

    /**
     * Dummy request from locationsService. Will wait 2 seconds before returning data.
     * Expand LocationsService class to get data from a server in the future.
     */
    getLocations(): void {
        this.locationsService = LocationsService.getLocationsSlowly()
            .then(locations =>
                this.unmodifiedLocations = locations);
    }
    /**
     * Build array of Marker objects from the raw data returned from locationService
     */
    initBuildList(list: any): Marker[] {
        var markers = list.map((data: any, index: number) => {
            data.map = this.map;
            data.animation = google.maps.Animation.DROP;
            data.id = index;
            data.icon = Marker.defaultIcon;
            var marker = new Marker(data);
            this.bounds.extend(marker.getPosition());
            return marker;
        });
        this.map.fitBounds(this.bounds);
        return markers;
    }


}
/**
 * Custom Marker object which extends google.maps.Marker.
 * Knockout Observable array of these objects are contained in MarkerModel class above
 */
export class Marker extends google.maps.Marker {
    static defaultIcon = Marker.makeMarkerIcon('0091ff');
    static highlightedIcon = Marker.makeMarkerIcon('FFFF24');
    //static fetchingIcon = MyMarker.makeMarkerIcon('FF00CB');
    //static fetchedIcon = MyMarker.makeMarkerIcon('99FF00');
    private yelpService: Promise<any>;
    private streetViewService: Promise<any>;
    private yelpData: any;
    private streetViewData: any;

    constructor(data: any) {
        super(data);
        this.yelpData = {
            fetching: false,
            fetched: false,
            jquery: $('<div id="yelp-data">loading Yelp data...</div>')
        }
        this.streetViewData = {
            pano_id: null as string,
            panoramaOptions: null as google.maps.StreetViewPanoramaOptions,
            errorMessage: null as string
        }
        this.addListener('click', () => {
            this.populateInfoWindow();
        });
        this.addListener('mouseover', () => {
            this.setIcon(Marker.highlightedIcon);
        });
        this.addListener('mouseout', () => {
            this.setIcon(Marker.defaultIcon);
        });
    }

    static makeMarkerIcon(markerColor: string): google.maps.Icon {
        return {
            url: 'http://chart.googleapis.com/chart?chst=d_map_spin&chld=1.15|0|' +
            markerColor +
            '|40|_|%E2%80%A2',
            size: new google.maps.Size(21, 34),
            origin: new google.maps.Point(0, 0),
            anchor: new google.maps.Point(10, 34),
            scaledSize: new google.maps.Size(21, 34)
        }
    }

    /**
     * Knockout connected function to every marker object.
     * Triggered during click of marker or list item 
     */
    populateInfoWindow(): void {
        var infoWindow = viewModel.infoWindow;
        var map = viewModel.map;
        var self = this;
        initOpenWindow();


        /**
         * Display info when both async requests are fulfilled
         */
        Promise.all([this.streetViewService, this.yelpService])
            .then(() => {
                var content = $('<div id="infowindow-content"><div id="pano"></div></div>');
                content.append(self.yelpData.jquery);
                infoWindow.setContent(content.html()); // DOM manipulation is not done with jquery
                if (this.streetViewData.errorMessage) {
                    content.children('#pano').html(this.streetViewData.errorMessage);
                    infoWindow.setContent(content.html()); // DOM manipulation is not done with jquery
                } else {
                    const panorama = new google.maps.StreetViewPanorama(
                        document.getElementById('pano'),
                        this.streetViewData.panoramaOptions);
                    panorama.setPano(this.streetViewData.pano_id);
                    panorama.setVisible(true);
                }

            });

        function initOpenWindow() {
            var content = $('<div id="infowindow-content"><div id="pano">Loading StreetView...</div></div>');
            content.append(self.yelpData.jquery);
            infoWindow.setContent(content.html());
            infoWindow.open(map, self);
            self.setIcon(Marker.highlightedIcon);
        }

        infoWindow.addListener('closeclick', () => {
            this.setIcon(Marker.defaultIcon);
        });

        infoWindow.addListener('position_changed', () => {
            var same = infoWindow.getPosition().equals(this.getPosition());
            if (same) {
                this.setIcon(Marker.highlightedIcon);
            } else {
                this.setIcon(Marker.defaultIcon);
            }

        });


    }

    /**
     * Prefetches data for streetview to be displayed later
     */
    fetchStreetView() {
        var SS = new StreetViewService();
        this.streetViewService = SS.injectPanorama(this)
            .then((result: any) => {
                this.streetViewData.pano_id = result.pano_id;
                this.streetViewData.panoramaOptions = result.panoramaOptions;
            })
            .catch(error => {
                this.streetViewData.errorMessage = 'No Street View Found';
            });
    }

    /**
     * Prefetches data for Yelp to be displayed later
     */
    fetchYelp() {
        if (!this.yelpData.fetching && !this.yelpData.fetched) {
            //this.setIcon(MyMarker.fetchingIcon);
            this.yelpData.fetching = true;
            var latlng = this.getPosition().lat() + ',' + this.getPosition().lng();
            this.yelpService = YelpService.searchRequest(this.getTitle(), latlng)
                .then(response => {
                    if (response.businesses.length > 0) {
                        const name = $('<div></div>').html(response.businesses[0].name).css('font-weight', 'bold');
                        const category = $('<div></div>').html(response.businesses[0].categories[0][0]);
                        const address = $('<div></div>').html(response.businesses[0].location.address[0]);
                        const img = $('<img></img>').attr('src', response.businesses[0].rating_img_url_small);
                        const link = $('<div></div>')
                            .append($('<a></a>')
                                .attr('href', response.businesses[0].url)
                                .html('Yelp link')
                                .css('color', 'black'));
                        this.yelpData.jquery.html('');
                        this.yelpData.jquery
                            .append(name)
                            .append(category)
                            .append(address)
                            .append(img)
                            .append(link);

                    } else {
                        this.yelpData.jquery.html('No Yelp results found').css('font-weight', 'bold');
                    }
                })
                .catch(error => {
                    console.log(error);
                    this.yelpData.jquery.html('Problem contacting Yelp, please try again later')
                        .css('font-weight', 'bold');
                })
                .then(() => {
                    this.yelpData.fetched = true;
                    this.yelpData.fetching = false;
                    //this.setIcon(MyMarker.fetchedIcon);
                });

        }
    }
}

