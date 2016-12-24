define(["require", "exports", "jquery", "oauthSignature"], function (require, exports, $, oauthSignature) {
    "use strict";
    /**
     * Class for requesting data from Yelp API https://www.yelp.com.au/developers/documentation/v2/overview.
     */
    class YelpService {
        static nonce_generate() {
            return (Math.floor(Math.random() * 1e12).toString());
        }
        static searchRequest(name, latlng) {
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
                var request = $.ajax(YelpService.YELP_BASE_URL_SEARCH, {
                    data: parameters,
                    cache: true,
                    dataType: 'jsonp'
                });
                var jsonpTimeout = setTimeout(() => {
                    reject('failed to get Yelp resources for ' + name);
                }, 8000);
                request.done(response => {
                    clearTimeout(jsonpTimeout);
                    resolve((response));
                });
                request.fail(error => {
                    // handled with timer
                });
            });
        }
    }
    YelpService.YELP_KEY = 'EzR5NHsrfy7yuviBugck3Q';
    YelpService.YELP_TOKEN = '2rrqf_1gVHsrX859DsIaVc2i1an9-7a-';
    YelpService.YELP_KEY_SECRET = 'gTQ9lhsM_VX1Nyq4Gi6fhr4z5bw';
    YelpService.YELP_TOKEN_SECRET = 'txYfYZo1YGb-Zi4nYLKDQVSkEPA';
    YelpService.YELP_BASE_URL_SEARCH = 'https://api.yelp.com/v2/search';
    exports.YelpService = YelpService;
});
//# sourceMappingURL=yelp-service.js.map