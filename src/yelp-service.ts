import * as $ from 'jquery';
import * as oauthSignature from 'oauthSignature';

export class YelpService {

    static YELP_KEY: string = 'EzR5NHsrfy7yuviBugck3Q';
    static YELP_TOKEN: string = '2rrqf_1gVHsrX859DsIaVc2i1an9-7a-';
    static YELP_KEY_SECRET: string = 'gTQ9lhsM_VX1Nyq4Gi6fhr4z5bw';
    static YELP_TOKEN_SECRET: string = 'txYfYZo1YGb-Zi4nYLKDQVSkEPA';
    static YELP_BASE_URL_SEARCH: string = 'https://api.yelp.com/v2/search';

    static nonce_generate(): string {
        return (Math.floor(Math.random() * 1e12).toString());
    }

    static searchRequest(name: string, latlng: string): Promise<any> {
        var parameters = {
            oauth_consumer_key: YelpService.YELP_KEY,
            oauth_token: YelpService.YELP_TOKEN,
            oauth_nonce: YelpService.nonce_generate(),
            oauth_timestamp: Math.floor(Date.now() / 1000),
            oauth_signature_method: 'HMAC-SHA1',
            oauth_version: '1.0',
            callback: 'cb',
            ll: latlng,
            term: name
        };

        var encodedSignature = oauthSignature.generate('GET', YelpService.YELP_BASE_URL_SEARCH, parameters, YelpService.YELP_KEY_SECRET, YelpService.YELP_TOKEN_SECRET);
        parameters.oauth_signature = encodedSignature;
        return new Promise((resolve, reject) => {
            var request: JQueryXHR = $.ajax(
                YelpService.YELP_BASE_URL_SEARCH,
                {
                    data: parameters,
                    cache: true,
                    dataType: 'jsonp'
                }
            );

            var jsonpTimeout = setTimeout(() => {
                reject('failed to get Yelp resources for ' + name);
            },
                8000);

            request.done(response => {
                clearTimeout(jsonpTimeout);
                resolve((response) as any);
            });

            request.fail(error => {
                // handled with timer
            });
        });
    }
}