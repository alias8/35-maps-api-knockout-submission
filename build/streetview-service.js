define(["require", "exports"], function (require, exports) {
    "use strict";
    class StreetViewService extends google.maps.StreetViewService {
        constructor() {
            super(...arguments);
            this.radius = 50;
        }
        injectPanorama(marker) {
            return new Promise((resolve, reject) => {
                this.getPanorama({
                    location: marker.getPosition(),
                    radius: this.radius
                }, (data, status) => {
                    if (status === google.maps.StreetViewStatus.OK) {
                        const nearStreetViewLocation = data.location.latLng;
                        const heading = google.maps.geometry.spherical.computeHeading(nearStreetViewLocation, marker.getPosition());
                        const panoramaOptions = {
                            position: nearStreetViewLocation,
                            pov: {
                                heading: heading,
                                pitch: 30
                            }
                        };
                        var result = {
                            pano_id: data.location.pano,
                            panoramaOptions: panoramaOptions
                        };
                        resolve(result);
                    }
                    else {
                        reject(status);
                    }
                });
            });
        }
    }
    exports.StreetViewService = StreetViewService;
});
//# sourceMappingURL=streetview-service.js.map