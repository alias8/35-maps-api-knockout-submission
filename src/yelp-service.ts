import * as $ from 'jquery'; // these are looking for the node_modules/@types/jquery/index.d.ts file
import * as oauthSignature from 'oauthSignature'; // 
/**
 * Class for requesting data from Yelp API https://www.yelp.com.au/developers/documentation/v2/overview.
 */
export class YelpService {

    static YELP_KEY = 'EzR5NHsrfy7yuviBugck3Q';
    static YELP_TOKEN = '2rrqf_1gVHsrX859DsIaVc2i1an9-7a-';
    static YELP_KEY_SECRET = 'gTQ9lhsM_VX1Nyq4Gi6fhr4z5bw';
    static YELP_TOKEN_SECRET = 'txYfYZo1YGb-Zi4nYLKDQVSkEPA';
    static YELP_BASE_URL_SEARCH = 'https://api.yelp.com/v2/search';

    static nonce_generate(): string {
        return (Math.floor(Math.random() * 1e12).toString());
    }

    static searchRequest(name: string, latlng: string): Promise<any> {
        var parameters :any = {
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

            request.done(response => {
                resolve((response) as any);
            });

            request.fail((jqXHR, textStatus) => {
                reject('failed to get Yelp resources for ' + name);
            });
        });
    }
}