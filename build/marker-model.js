define(["require", "exports", "jquery", "knockout", "./streetview-service", "./yelp-service", "./viewmodel", "./locations-service"], function (require, exports, $, ko, streetview_service_1, yelp_service_1, viewmodel_1, locations_service_1) {
    "use strict";
    /**
     *
     */
    class MarkerModel {
        constructor(map, bounds, infoWindow) {
            this.map = map;
            this.bounds = bounds;
            this.infoWindow = infoWindow;
            this.locationsList = [];
            this.loading = ko.observable(true);
            this.filterWord = ko.observable('').extend({ notify: 'always' });
            this.filteredLocationsList = ko.pureComputed(() => {
                var re = new RegExp(this.filterWord(), 'i');
                var filtered = this.locationsList
                    .filter(item => {
                    var match = re.test(item.getTitle());
                    if (match) {
                        item.setMap(map);
                    }
                    else {
                        item.setMap(null);
                    }
                    return match;
                });
                return filtered;
            }, this);
            this.getLocations();
            Promise.all([this.locationsService])
                .then(() => {
                this.locationsList = this.initBuildList(this.unmodifiedLocations);
                this.filterWord('');
                this.loading(false);
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
        getLocations() {
            this.locationsService = locations_service_1.LocationsService.getLocationsSlowly() // or getLocationsSlowly()
                .then(locations => this.unmodifiedLocations = locations);
        }
        initBuildList(list) {
            var markers = list.map((data, index) => {
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
    exports.MarkerModel = MarkerModel;
    /**
     * Custom Marker object which extends google.maps.Marker.
     * Knockout Observable array of these objects are contained in MarkerModel class above
     */
    class Marker extends google.maps.Marker {
        constructor(data) {
            super(data);
            this.yelpData = {
                fetching: false,
                fetched: false,
                jquery: $('<div id="yelp-data">loading Yelp data...</div>')
            };
            this.streetViewData = {
                pano_id: null,
                panoramaOptions: null
            };
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
        static makeMarkerIcon(markerColor) {
            return {
                url: 'http://chart.googleapis.com/chart?chst=d_map_spin&chld=1.15|0|' +
                    markerColor +
                    '|40|_|%E2%80%A2',
                size: new google.maps.Size(21, 34),
                origin: new google.maps.Point(0, 0),
                anchor: new google.maps.Point(10, 34),
                scaledSize: new google.maps.Size(21, 34)
            };
        }
        /**
         * Knockout connected function to every marker object.
         * Triggered during click of marker or list item
         */
        populateInfoWindow() {
            var infoWindow = viewmodel_1.viewModel.infoWindow;
            var map = viewmodel_1.viewModel.map;
            var self = this;
            initOpenWindow();
            /**
             * Display info when both async requests are fulfilled
             */
            Promise.all([this.streetViewService, this.yelpService])
                .then(() => {
                const panorama = new google.maps.StreetViewPanorama(document.getElementById('pano'), this.streetViewData.panoramaOptions);
                panorama.setPano(this.streetViewData.pano_id);
                panorama.setVisible(true);
                $('#yelp-data').html(this.yelpData.jquery.html());
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
                }
                else {
                    this.setIcon(Marker.defaultIcon);
                }
            });
        }
        /**
         * Prefetches data for streetview to be displayed later
         */
        fetchStreetView() {
            var SS = new streetview_service_1.StreetViewService();
            this.streetViewService = SS.injectPanorama(this)
                .then((result) => {
                this.streetViewData.pano_id = result.pano_id;
                this.streetViewData.panoramaOptions = result.panoramaOptions;
            })
                .catch(error => {
                $('#pano').html('No Street View Found');
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
                this.yelpService = yelp_service_1.YelpService.searchRequest(this.getTitle(), latlng)
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
                    }
                    else {
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
    Marker.defaultIcon = Marker.makeMarkerIcon('0091ff');
    Marker.highlightedIcon = Marker.makeMarkerIcon('FFFF24');
    exports.Marker = Marker;
});
//# sourceMappingURL=marker-model.js.map