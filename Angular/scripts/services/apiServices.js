(function () {
    'use strict';
    angular
      .module('apiServices', [])
      .service('apiServices', apiServices);

    function apiServices($q, $http) {
        this.makeRequest = function (ApiObj) {
            ApiObj.url = ApiObj.URL;
            var deffered = $q.defer();
            $http(ApiObj)
                .then(function (data) {
                    deffered.resolve(data);
                }, function (data) {
                    deffered.reject(data);
                })
            return deffered.promise;
        }
    }
})();
