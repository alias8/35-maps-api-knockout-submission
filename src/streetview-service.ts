import {Marker} from './marker-model';

export class StreetViewService extends google.maps.StreetViewService {
    private radius = 50;

    injectPanorama(marker: Marker): Promise<string> {
        return new Promise((resolve, reject) => {
            this.getPanorama({
                location: marker.getPosition(),
                radius: this.radius
            },
                (data, status) => {
                    if (status === google.maps.StreetViewStatus.OK) {
                        const nearStreetViewLocation = data.location.latLng;
                        const heading = google.maps.geometry.spherical.computeHeading(
                            nearStreetViewLocation,
                            marker.getPosition());
                        const panoramaOptions = {
                            position: nearStreetViewLocation,
                            pov: {
                                heading: heading,
                                pitch: 30
                            }
                        };
                        var result: any = {
                            pano_id: data.location.pano,
                            panoramaOptions: panoramaOptions
                        }
                        resolve(result);
                    } else {
                        reject(status);
                    }
                });
        });


    }
}