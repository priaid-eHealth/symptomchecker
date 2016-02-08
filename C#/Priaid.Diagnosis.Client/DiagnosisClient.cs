using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net;
using System.Security.Cryptography;
using System.Text;
using System.Threading.Tasks;
using System.Web.Script.Serialization;
using Priaid.Diagnosis.Client.Model;

namespace Priaid.Diagnosis.Client
{
    public class DiagnosisClient
    {
        private readonly AccessToken _token;
        private readonly string _language;
        private readonly string _healthServiceUrl;
        private JavaScriptSerializer _serializer;

        /// <summary>
        /// DiagnosisClient constructor
        /// </summary>
        /// <param name="username">api user username</param>
        /// <param name="password">api user password</param>
        /// <param name="authServiceUrl">priaid login url (https://authservice.priaid.ch/login)</param>
        /// <param name="language">language</param>
        /// <param name="healthServiceUrl">priaid healthservice url(https://healthservice.priaid.ch)</param>
        public DiagnosisClient(string username, string password, string authServiceUrl, string language, string healthServiceUrl)
        {
            this.HandleRequiredArguments(username, password, authServiceUrl, language, healthServiceUrl);

            this._serializer = new JavaScriptSerializer() { MaxJsonLength = int.MaxValue };

            this._token = LoadToken(username, password, authServiceUrl);
            this._healthServiceUrl = healthServiceUrl;
            this._language = language;
        }

        public AccessToken LoadToken(string username, string password, string url)
        {
            byte[] secretBytes = Encoding.UTF8.GetBytes(password);
            string computedHashString = "";
            using (HMACMD5 hmac = new HMACMD5(secretBytes))
            {
                byte[] dataBytes = Encoding.UTF8.GetBytes(url);
                byte[] computedHash = hmac.ComputeHash(dataBytes);
                computedHashString = Convert.ToBase64String(computedHash);
            }

            using (WebClient client = new WebClient() { Encoding = Encoding.UTF8 })
            {
                client.Headers["Authorization"] = string.Concat("Bearer ", username, ":", computedHashString);
                try
                {
                    string result_from_webservice = client.UploadString(url, "POST", "");
                    // Deserialize token object
                    AccessToken token = this._serializer.Deserialize<AccessToken>(result_from_webservice);
                    return token;
                }
                catch (WebException e)
                {
                    throw RetrieveException(e);
                }
            }
        }

        private Exception RetrieveException(WebException ex)
        {
            using (StreamReader reader = new StreamReader(ex.Response.GetResponseStream()))
            {
                string response = reader.ReadToEnd();

                string exception = this.Deserialize<string>(response);
                return new Exception(exception);
            }
        }

        private void HandleRequiredArguments(string username, string password, string authServiceUrl, string language, string healthServiceUrl)
        {
            if (string.IsNullOrEmpty(username))
                throw new ArgumentNullException("Argument missing: username");

            if (string.IsNullOrEmpty(password))
                throw new ArgumentNullException("Argument missing: password");

            if (string.IsNullOrEmpty(authServiceUrl))
                throw new ArgumentNullException("Argument missing: authServiceUrl");

            if (string.IsNullOrEmpty(language))
                throw new ArgumentNullException("Argument missing: language");

            if (string.IsNullOrEmpty(healthServiceUrl))
                throw new ArgumentNullException("Argument missing: healthServiceUrl");

        }

        private T LoadFromWebService<T>(string action)
        {
            using (WebClient client = new WebClient() { Encoding = Encoding.UTF8 })
            {
                string extraArgs = string.Format("token={0}&format=json&language={1}", this._token.Token, this._language);

                string url = string.Concat(this._healthServiceUrl, "/", action, action.Contains("?") ? "&" : "?", extraArgs);

                try
                {
                    string result_from_webservice = client.DownloadString(url);
                    T result = this.Deserialize<T>(result_from_webservice);
                    return result;
                }
                catch (WebException e)
                {
                    throw RetrieveException(e);
                }
            }
        }

        private T Deserialize<T>(string serializedString)
        {
            return (T)this._serializer.Deserialize(serializedString, typeof(T));
        }

        /// <summary>
        /// Load all symptoms
        /// </summary>
        /// <returns>Returns list of all symptoms</returns>
        public List<HealthItem> LoadSymptoms()
        {
            return this.LoadFromWebService<List<HealthItem>>("symptoms");
        }

        /// <summary>
        /// Load all issues
        /// </summary>
        /// <returns>Returns list of all issues</returns>
        public List<HealthItem> LoadIssues()
        {
            return this.LoadFromWebService<List<HealthItem>>("issues");
        }

        /// <summary>
        /// Load detail informations about selected issue
        /// </summary>
        /// <param name="issueId"></param>
        /// <returns>Returns detail informations about selected issue</returns>
        public HealthIssueInfo LoadIssueInfo(int issueId)
        {
            string action = string.Format("issues/{0}/info", issueId);
            return this.LoadFromWebService<HealthIssueInfo>(action);
        }

        /// <summary>
        /// Load calculated list of potential issues for selected parameters
        /// </summary>
        /// <param name="selectedSymptoms">List of selected symptom ids</param>
        /// <param name="gender">Selected person gender (Male, Female)</param>
        /// <param name="yearOfBirth">Selected person year of born</param>
        /// <returns>Returns calculated list of potential issues for selected parameters</returns>
        public List<HealthDiagnosis> LoadDiagnosis(List<int> selectedSymptoms, Gender gender, int yearOfBirth)
        {
            if (selectedSymptoms == null || selectedSymptoms.Count == 0)
                throw new ArgumentNullException("selectedSymptoms  Can not be null or empty");

            string serializedSymptoms = this._serializer.Serialize(selectedSymptoms);
            string action = string.Format("diagnosis?symptoms={0}&gender={1}&year_of_birth={2}", serializedSymptoms, gender.ToString(), yearOfBirth);
            return this.LoadFromWebService<List<HealthDiagnosis>>(action);
        }

        /// <summary>
        /// Load human body locations
        /// </summary>
        /// <returns>Returns list of human body locations</returns>
        public List<HealthItem> LoadBodyLocations()
        {
            return LoadFromWebService<List<HealthItem>>("body/locations");
        }

        /// <summary>
        /// Load human body sublocations for selected human body location
        /// </summary>
        /// <param name="bodyLocationId">Human body location id</param>
        /// <returns>Returns list of human body sublocations for selected human body location</returns>
        public List<HealthItem> LoadBodySubLocations(int bodyLocationId)
        {
            string action = string.Format("body/locations/{0}", bodyLocationId);
            return this.LoadFromWebService<List<HealthItem>>(action);
        }

        /// <summary>
        /// Load all symptoms for selected human body location
        /// </summary>
        /// <param name="locationId">Human body sublocation id</param>
        /// <param name="selectedSelectorStatus">Selector status (Man, Woman, Boy, Girl)</param>
        /// <returns>Returns list of all symptoms for selected human body location</returns>
        public List<HealthSymptomSelector> LoadSublocationSymptoms(int locationId, SelectorStatus selectedSelectorStatus)
        {
            string action = string.Format("symptoms/{0}/{1}", locationId, selectedSelectorStatus.ToString());
            return this.LoadFromWebService<List<HealthSymptomSelector>>(action);
        }

        /// <summary>
        /// Load list of proposed symptoms for selected symptoms combination
        /// </summary>
        /// <param name="selectedSymptoms">List of selected symptom ids</param>
        /// <param name="gender">Selected person gender (Male, Female)</param>
        /// <param name="yearOfBirth">Selected person year of born</param>
        /// <returns>Returns list of proposed symptoms for selected symptoms combination</returns>
        public List<HealthItem> LoadProposedSymptoms(List<int> selectedSymptoms, Gender gender, int yearOfBirth)
        {
            if (selectedSymptoms == null || selectedSymptoms.Count == 0)
                throw new ArgumentNullException("selectedSymptoms  Can not be null or empty");

            string serializedSymptoms = this._serializer.Serialize(selectedSymptoms);
            string action = string.Format("symptoms/proposed?symptoms={0}&gender={1}&year_of_birth={2}", serializedSymptoms, gender.ToString(), yearOfBirth);

            return this.LoadFromWebService<List<HealthItem>>(action);
        }

        /// <summary>
        /// Load red flag text for selected symptom
        /// </summary>
        /// <param name="symptomId">Selected symptom id</param>
        /// <returns>Returns red flag text for selected symptom</returns>
        public string LoadRedFlag(int symptomId)
        {
            string action = string.Format("redflag?symptomId={0}", symptomId);
            return this.LoadFromWebService<string>(action);
        }
    }
}
