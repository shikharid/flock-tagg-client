/**
 * Created by shikhar.s on 25/08/16.
 */

'use strict';

angular.module("taggApp").config(['$locationProvider', '$resourceProvider', 'RestangularProvider',
    function ($locationProvider, $resourceProvider, RestangularProvider) {
		$locationProvider.html5Mode({
                  enabled: true
        });
        var API_URL = "https://75597844.ngrok.io/";
        RestangularProvider.setBaseUrl(API_URL);
        $resourceProvider.defaults.stripTrailingSlashes = false;
    }]);

