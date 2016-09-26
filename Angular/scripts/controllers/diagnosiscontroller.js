(function () {
    'use strict';
    angular
        .module('ngApp', ['apiServices', 'tokenFactory', 'languageFactory', 'formatFactory', 'apiUrls'])
        .controller('ngAppDiagnosisController', ngAppDiagnosisController);

    function ngAppDiagnosisController($scope, apiServices, tokenFactory, languageFactory, formatFactory, apiUrls) {
        var vm = $scope;

		vm.symptoms = '';
		vm.symptomsConfig= '';
		vm.symptomsError = '';
		
		vm.issues = '';
		vm.issuesConfig= '';
		vm.issuesError = '';
		
		vm.issueInfo = '';
		vm.issueInfoConfig = '';
		vm.issueInfoError = '';
		vm.issueId = 237;
		
		vm.diagnosis = '';
		vm.diagnosisConfig = '';
		vm.diagnosisError = '';
		
		vm.specialisations = '';
		vm.specialisationsConfig = '';
		vm.specialisationsError = '';
		
		vm.proposedSymptoms = '';
		vm.proposedSymptomsConfig = '';
		vm.proposedSymptomsError = '';
		
		vm.selectedSymptoms = '13';
		vm.gender = {
			value: 'male'
		}
		vm.yearOfBirth = 1988;
		vm.selectorStatus = {
			value: 'man'
		}
		
		vm.bodyLocations = '';
		vm.bodyLocationsConfig = '';
		vm.bodyLocationsError = '';
		
		vm.bodySublocations = '';
		vm.bodySublocationsConfig = '';
		vm.bodySublocationsError = '';
		vm.bodyLocationId = 16;
		
		vm.bodySublocationSymptoms = '';
		vm.bodySublocationSymptomsConfig = '';
		vm.bodySublocationSymptomsError = '';
		vm.bodySublocationId = 0;
		
		vm.redFlagText = '';
		vm.redFlagTextConfig = '';
		vm.redFlagTextError = '';
		vm.symptomId = 238;
		
		vm.languages=[{value:"en-gb",name:"en-gb"},{value:"de-ch",name:"de-ch"},{value:"fr-fr",name:"fr-fr"},{value:"es-es",name:"es-es"},{value:"tr-tr",name:"tr-tr"}]
		//Setting first option as selected in configuration select
		vm.lang = vm.languages[0].value;
		
		vm.formats=[{value:"json",name:"json"},{value:"xml",name:"xml"}]
		//Setting first option as selected in configuration select
		vm.format = vm.formats[0].value;
		
		vm.token = '';

        /**
          * [loadSymptoms Function makes an api call to get all symptom names and ids ]
          */

        vm.loadSymptoms = function () {
			var url = apiUrls.loadSymptoms;
			generic_api_call(url, 'symptoms','symptomsError','symptomsConfig');
        }

        /**
          * [loadIssues Function makes an api call to get all issues names and ids ]
          */
		
		vm.loadIssues = function () {
			var url = apiUrls.loadIssues;
			generic_api_call(url, 'issues','issuesError','issuesConfig');
        }
		
        /**
          * [loadIssueInfo Function makes an api call to get all issue info ]
          */
		vm.loadIssueInfo = function (issueId) {
			var url = apiUrls.loadIssueInfo+'/'+issueId+'/info';
			generic_api_call(url, 'issueInfo','issueInfoError','issueInfoConfig');
        }
		
        /**
          * [loadDiagnosis Function makes an api call to get diagnosis for given parameters]
          */
		vm.loadDiagnosis = function (selectedSymptoms, gender, yearOfBirth) {
			var symptoms = selectedSymptoms.split(',');
			var url = apiUrls.loadDiagnosis+'?symptoms='+JSON.stringify(symptoms)+'&gender='+gender.value+'&year_of_birth='+yearOfBirth;
			generic_api_call(url, 'diagnosis','diagnosisError','diagnosisConfig');
        }
		
        /**
          * [loadSpecialisations Function makes an api call to get specialisations for given parameters]
          */
		vm.loadSpecialisations = function (selectedSymptoms, gender, yearOfBirth) {
			var symptoms = selectedSymptoms.split(',');
			var url = apiUrls.loadSpecialisations+'?symptoms='+JSON.stringify(symptoms)+'&gender='+gender.value+'&year_of_birth='+yearOfBirth;
			generic_api_call(url, 'specialisations','specialisationsError','specialisationsConfig');
        }
		
        /**
          * [loadBodyLocations Function makes an api call to get all body locations]
          */
		vm.loadBodyLocations = function () {			
			var url = apiUrls.loadBodyLocations;
			generic_api_call(url, 'bodyLocations','bodyLocationsError','bodyLocationsConfig');
        }
		
        /**
          * [loadBodySublocations Function makes an api call to get all body sublocations
          * to call other api]
          */
		vm.loadBodySublocations = function (bodyLocationId) {
			var url = apiUrls.loadBodySublocations+'/'+bodyLocationId;
			generic_api_call(url, 'bodySublocations','bodySublocationsError','bodySublocationsConfig');
        }
		
        /**
          * [loadBodySublocationSymptoms Function makes an api call to get all symptoms for body sublocations. To get all symptoms, bodySublocationId = 0]
          */
		vm.loadBodySublocationSymptoms = function (bodySublocationId, selectorStatus) {
			var url = apiUrls.loadBodySublocationSymptoms+'/'+bodySublocationId+'/'+selectorStatus.value;
			generic_api_call(url, 'bodySublocationSymptoms','bodySublocationSymptomsError','bodySublocationSymptomsConfig');
        }
		
        /**
          * [loadProposedSymptoms Function makes an api call to get proposed symptoms for given parameters
          * to call other api]
          */
		vm.loadProposedSymptoms = function (selectedSymptoms, gender, yearOfBirth) {
			var symptoms = selectedSymptoms.split(',');
			var url = apiUrls.loadProposedSymptoms+'?symptoms='+JSON.stringify(symptoms)+'&gender='+gender.value+'&year_of_birth='+yearOfBirth;
			generic_api_call(url, 'proposedSymptoms','proposedSymptomsError','proposedSymptomsConfig');
        }
		
        /**
          * [loadRedFlagText Function makes an api call to get red flag text for selected symptomId]
          */
		vm.loadRedFlagText = function (symptomId) {
			var url = apiUrls.loadRedFlagText+'?symptomId='+symptomId;
			generic_api_call(url, 'redFlagText','redFlagTextError','redFlagTextConfig');
        }
		
        /**
          * [changeLanguage helper Function to change language]
          */
		vm.changeLanguage = function()
		{
			console.log(vm.lang);
			languageFactory.storeLanguage(vm.lang)
		}
		
        /**
          * [changeFormat helper Function to change format of the response]
          */
		vm.changeFormat = function()
		{
			console.log(vm.format);
			formatFactory.storeFormat(vm.format);
		}
		
		$scope.$watch(
			function watchToken( scope ) {
				// Return the "result" of the watch expression.
				return( vm.token );
			},
			function handleTokenChange( newValue, oldValue ) {
				tokenFactory.storeToken(newValue);
				console.log( "fn( vm.token ):", newValue );
			}
		);
		
		function generic_api_call(url, scope_variable_name, scope_error_variable_name, scope_config_variable_name)
		{
			var extraArgs = 'token='+tokenFactory.storeToken()+'&language='+languageFactory.storeLanguage()+'&format='+formatFactory.storeFormat()
			url += url.indexOf("?") > 0 ? "&"+extraArgs : "?"+extraArgs;
			vm[scope_variable_name] = "loading data from web service...";
			apiServices.makeRequest({
				URL: url,
				method: 'GET'
            })
			.then(function (data) {
				vm[scope_variable_name] = data.data != '' ? data.data : 'No results found';
				vm[scope_config_variable_name] = data.config;
				vm[scope_error_variable_name] = '';
				console.log('success', data);
			}, function (data) {
				vm[scope_variable_name] = '';
				vm[scope_config_variable_name] = '';
				vm[scope_error_variable_name] = data;
				console.log('error', data);
				return false;
			});
		}
    }
})();
