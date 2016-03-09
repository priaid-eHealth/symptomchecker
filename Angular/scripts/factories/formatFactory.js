/**
 * [Factory to store and get the format]
 * @return {format}
 */
(function () {
    'use strict';
    angular
      .module('formatFactory', [])
      .factory('formatFactory', formatFactory);
    function formatFactory() {
        var app = {};
        app.storeFormat = function (obj) {
            if (obj) {
                app.format = obj;
            } else {
				return app.format ? app.format : 'json';
            }
        }
        return app;
    }
})();
