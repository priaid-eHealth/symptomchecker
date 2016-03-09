(function () {
    'use strict';
	var baseUrl = 'https://sandbox-healthservice.priaid.ch/';
    angular
      .module('apiUrls',[])
	  .constant('apiUrls', {
		loadSymptoms: baseUrl+'symptoms',
		loadIssues: baseUrl+'issues',
		loadIssueInfo: baseUrl+'issues',
		loadDiagnosis: baseUrl+'diagnosis',
		loadSpecialisations: baseUrl+'diagnosis/specialisations',
		loadBodyLocations: baseUrl+'body/locations',
		loadBodySublocations: baseUrl+'body/locations/',
		loadBodySublocationSymptoms: baseUrl+'symptoms',
		loadProposedSymptoms: baseUrl+'symptoms/proposed',
		loadRedFlagText: baseUrl+'redflag'
	});
})();
