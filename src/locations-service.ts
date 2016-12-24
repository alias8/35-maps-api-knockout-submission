import { LOCATIONS } from './globals';

export class Location {
    'title': string;
    'position': {
        'lat': number,
        'lng': number;
    }
}

/**
 * Can be used by other classes to return a raw list of Location objects.
 * In practice, this would be expanded to collect data from a server instead of locally.
 */
export class LocationsService {
    static getLocations(): Promise<Location[]> {
        return Promise.resolve(LOCATIONS);
    }

    static getLocationsSlowly(): Promise<Location[]> {
        return new Promise(resolve => {
            // Simulate server latency with 2 second delay
            setTimeout(() => resolve(LocationsService.getLocations()), 2000);
        });
    }
}