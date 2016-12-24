define(["require", "exports", "./globals"], function (require, exports, globals_1) {
    "use strict";
    class Location {
    }
    exports.Location = Location;
    /**
     * Can be used by other classes to return a raw list of Location objects.
     * In practice, this would be expanded to collect data from a server instead of locally.
     */
    class LocationsService {
        static getLocations() {
            return Promise.resolve(globals_1.LOCATIONS);
        }
        static getLocationsSlowly() {
            return new Promise(resolve => {
                // Simulate server latency with 2 second delay
                setTimeout(() => resolve(LocationsService.getLocations()), 2000);
            });
        }
    }
    exports.LocationsService = LocationsService;
});
//# sourceMappingURL=locations-service.js.map