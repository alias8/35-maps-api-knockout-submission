define(["require", "exports", "knockout", "./marker-model", "./sidebar", "./globals"], function (require, exports, ko, marker_model_1, sidebar_1, globals_1) {
    "use strict";
    class ViewModel {
        constructor() {
            this.map = new google.maps.Map(document.getElementById('map'), {
                center: { lat: -33.865143, lng: 151.209900 },
                zoom: 13,
                styles: globals_1.STYLES,
                mapTypeControl: false
            });
            this.infoWindow = new google.maps.InfoWindow();
            this.bounds = new google.maps.LatLngBounds();
            this.sideBar = ko.observable(new sidebar_1.Sidebar());
            this.markerModel = ko.observable(new marker_model_1.MarkerModel(this.map, this.bounds, this.infoWindow));
            google.maps.event.addDomListener(window, 'resize', () => {
                this.map.fitBounds(this.bounds);
            });
        }
    }
    exports.viewModel = new ViewModel();
    ko.applyBindings(exports.viewModel);
});
//# sourceMappingURL=viewmodel.js.map