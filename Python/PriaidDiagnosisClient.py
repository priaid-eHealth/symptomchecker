import requests
import hmac, hashlib
import base64
import json
from enum import Enum

Gender = Enum('Gender', 'Male Female')

SelectorStatus = Enum('SelectorStatus', 'Man Woman Boy Girl')

class DiagnosisClient:
    'Client class for priaid diagnosis health service'       

    # <summary>
    # DiagnosisClient constructor
    # </summary>
    # <param name="username">api user username</param>
    # <param name="password">api user password</param>
    # <param name="authServiceUrl">priaid login url (https://authservice.priaid.ch/login)</param>
    # <param name="language">language</param>
    # <param name="healthServiceUrl">priaid healthservice url(https://healthservice.priaid.ch)</param>
    def __init__(self, username, password, authServiceUrl, language, healthServiceUrl):
        self._handleRequiredArguments(username, password, authServiceUrl, healthServiceUrl, language)

        self._language = language
        self._healthServiceUrl = healthServiceUrl
        self._token = self._loadToken(username, password, authServiceUrl)


    def _loadToken(self, username, password, url):
        rawHashString = hmac.new(bytes(password, encoding='utf-8'), url.encode('utf-8')).digest()
        computedHashString = base64.b64encode(rawHashString).decode()

        bearer_credentials = 'test_priaid:' + computedHashString
        postHeaders = {
                'Authorization': 'Bearer {}'.format(bearer_credentials)
        }
        responsePost = requests.post(url, headers=postHeaders)

        data = json.loads(responsePost.text)
        return data


    def _handleRequiredArguments(self, username, password, authUrl, healthUrl, language):
        if not username:
            raise ValueError("Argument missing: username")

        if not password:
            raise ValueError("Argument missing: username")

        if not authUrl:
            raise ValueError("Argument missing: authServiceUrl")

        if not healthUrl:
            raise ValueError("Argument missing: healthServiceUrl")

        if not language:
            raise ValueError("Argument missing: language")


    def _loadFromWebService(self, action):
        extraArgs = "token=" + self._token["Token"] + "&format=json&language=" + self._language
        if "?" not in action:
            action += "?" + extraArgs
        else:
            action += "&" + extraArgs

        url = self._healthServiceUrl + "/" + action
        response = requests.get(url)

        try:
            response.raise_for_status()
        except requests.exceptions.HTTPError as e:
            print ("----------------------------------")
            print ("HTTPError: " + e.response.text )
            print ("----------------------------------")
            raise

        try:
            dataJson = response.json()
        except ValueError:
            raise requests.exceptions.RequestException(response=response)

        data = json.loads(response.text)
        return data       


    # <summary>
    # Load all symptoms
    # </summary>
    # <returns>Returns list of all symptoms</returns>
    def loadSymptoms(self):
        return self._loadFromWebService("symptoms")


    # <summary>
    # Load all issues
    # </summary>
    # <returns>Returns list of all issues</returns>
    def loadIssues(self):
        return self._loadFromWebService("issues")


    # <summary>
    # Load detail informations about selected issue
    # </summary>
    # <param name="issueId"></param>
    # <returns>Returns detail informations about selected issue</returns>
    def loadIssueInfo(self, issueId):
        if isinstance( issueId, int ):
            issueId = str(issueId)
        action = "issues/{0}/info".format(issueId)
        return self._loadFromWebService(action)


    # <summary>
    # Load calculated list of potential issues for selected parameters
    # </summary>
    # <param name="selectedSymptoms">List of selected symptom ids</param>
    # <param name="gender">Selected person gender (Male, Female)</param>
    # <param name="yearOfBirth">Selected person year of born</param>
    # <returns>Returns calculated list of potential issues for selected parameters</returns>
    def loadDiagnosis(self, selectedSymptoms, gender, yearOfBirth):
        if not selectedSymptoms:
            raise ValueError("selectedSymptoms can not be empty")
        
        serializedSymptoms = json.dumps(selectedSymptoms)
        action = "diagnosis?symptoms={0}&gender={1}&year_of_birth={2}".format(serializedSymptoms, gender.name, yearOfBirth)
        return self._loadFromWebService(action)



    # <summary>
    # Load calculated list of specialisations for selected parameters
    # </summary>
    # <param name="selectedSymptoms">List of selected symptom ids</param>
    # <param name="gender">Selected person gender (Male, Female)</param>
    # <param name="yearOfBirth">Selected person year of born</param>
    # <returns>Returns calculated list of specialisations for selected parameters</returns>
    def loadSpecialisations(self, selectedSymptoms, gender, yearOfBirth):
        if not selectedSymptoms:
            raise ValueError("selectedSymptoms can not be empty")
        
        serializedSymptoms = json.dumps(selectedSymptoms)
        action = "diagnosis/specialisations?symptoms={0}&gender={1}&year_of_birth={2}".format(serializedSymptoms, gender.name, yearOfBirth)
        return self._loadFromWebService(action)
    


    # <summary>
    # Load human body locations
    # </summary>
    # <returns>Returns list of human body locations</returns>
    def loadBodyLocations(self):
        return self._loadFromWebService("body/locations")


    # <summary>
    # Load human body sublocations for selected human body location
    # </summary>
    # <param name="bodyLocationId">Human body location id</param>
    # <returns>Returns list of human body sublocations for selected human body location</returns>
    def loadBodySubLocations(self, bodyLocationId):
        action = "body/locations/{0}".format(bodyLocationId)
        return self._loadFromWebService(action)


    # <summary>
    # Load all symptoms for selected human body location
    # </summary>
    # <param name="locationId">Human body sublocation id</param>
    # <param name="selectedSelectorStatus">Selector status (Man, Woman, Boy, Girl)</param>
    # <returns>Returns list of all symptoms for selected human body location</returns>
    def loadSublocationSymptoms(self, locationId, selectedSelectorStatus):
        action = "symptoms/{0}/{1}".format(locationId, selectedSelectorStatus.name)
        return self._loadFromWebService(action)


    # <summary>
    # Load list of proposed symptoms for selected symptoms combination
    # </summary>
    # <param name="selectedSymptoms">List of selected symptom ids</param>
    # <param name="gender">Selected person gender (Male, Female)</param>
    # <param name="yearOfBirth">Selected person year of born</param>
    # <returns>Returns list of proposed symptoms for selected symptoms combination</returns>
    def loadProposedSymptoms(self, selectedSymptoms, gender, yearOfBirth):
        if not selectedSymptoms:
            raise ValueError("selectedSymptoms can not be empty")
        
        serializedSymptoms = json.dumps(selectedSymptoms)
        action = "symptoms/proposed?symptoms={0}&gender={1}&year_of_birth={2}".format(serializedSymptoms, gender.name, yearOfBirth)
        return self._loadFromWebService(action)


    # <summary>
    # Load red flag text for selected symptom
    # </summary>
    # <param name="symptomId">Selected symptom id</param>
    # <returns>Returns red flag text for selected symptom</returns>
    def loadRedFlag(self, symptomId):
        action = "redflag?symptomId={0}".format(symptomId)
        return self._loadFromWebService(action)
    
