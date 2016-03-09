/**
 * [Factory to store and get the token]
 * @return {token}
 */
(function () {
    'use strict';
    angular
      .module('tokenFactory', [])
      .factory('tokenFactory', tokenFactory);
    function tokenFactory() {
        var app = {};
        app.storeToken = function (obj) {
            if (obj) {
                app.token = obj;
            } else {
                return app.token;
            }
        }
        return app;
    }
})();
