/**
 * [Factory to store and get the language]
 * @return {language}
 */
(function () {
    'use strict';
    angular
      .module('languageFactory', [])
      .factory('languageFactory', languageFactory);
    function languageFactory() {
        var app = {};
        app.storeLanguage = function (obj) {
            if (obj) {
                app.language = obj;
            } else {
				return app.language ? app.language : 'en-gb';
            }
        }
        return app;
    }
})();
