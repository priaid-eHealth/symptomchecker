using System;
using System.Collections.Generic;
using System.Configuration;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Priaid.Diagnosis.Client;
using Priaid.Diagnosis.Client.Model;

namespace SampleDiagnosisClient
{
    class Program
    {
        private static DiagnosisClient _diagnosisClient;
        private static Random _random = new Random();

        static void Main(string[] args)
        {
            string username = ConfigurationManager.AppSettings["username"];
            string password = ConfigurationManager.AppSettings["password"];
            string authUrl = ConfigurationManager.AppSettings["priaid_authservice_url"];
            string healthUrl = ConfigurationManager.AppSettings["priaid_healthservice_url"];
            string language = ConfigurationManager.AppSettings["language"];

            CheckRequiredArgs(username, password, authUrl, healthUrl, language);

            _diagnosisClient = new DiagnosisClient(username, password, authUrl, language, healthUrl);

            Simulate();

            Exit();
        }

        static void CheckRequiredArgs(string username, string password, string authUrl, string healthUrl, string language)
        {
            if (string.IsNullOrEmpty(username))
                throw new ArgumentNullException("username in app.config is required");

            if (string.IsNullOrEmpty(password))
                throw new ArgumentNullException("password in app.config is required");

            if (string.IsNullOrEmpty(authUrl))
                throw new ArgumentNullException("priaid_authservice_url in app.config is required");

            if (string.IsNullOrEmpty(healthUrl))
                throw new ArgumentNullException("priaid_healthservice_url in app.config is required");

            if (string.IsNullOrEmpty(language))
                throw new ArgumentNullException("language in app.config is required");
        }

        static void Exit()
        {
            Console.WriteLine("press any key to exit");
            var result = Console.ReadLine();
        }

        static int GetRandom(int maxNumber)
        {
            return _random.Next(0, maxNumber); 
        }

        static void WriteHeaderMessage(string message)
        {
            Console.WriteLine("---------------------------------------------");
            Console.WriteLine(message);
            Console.WriteLine("---------------------------------------------");
        }

        static int LoadBodyLocations()
        {
            List<HealthItem> bodyLocations = _diagnosisClient.LoadBodyLocations();

            if (bodyLocations == null || bodyLocations.Count == 0)
                throw new Exception("Empty body locations results");

            WriteHeaderMessage("Body locations:");

            foreach (var loc in bodyLocations)
                Console.WriteLine("{0} ({1})",loc.Name,loc.ID);

            int randomLocIndex = GetRandom(bodyLocations.Count);
            HealthItem randomLocation = bodyLocations[randomLocIndex];

            WriteHeaderMessage(string.Format("Sublocations for randomly selected location {0}", randomLocation.Name));

            return randomLocation.ID;
        }

        static int LoadBodySublocations(int locId)
        {
            List<HealthItem> bodySublocations = _diagnosisClient.LoadBodySubLocations(locId);

            if (bodySublocations == null || bodySublocations.Count == 0)
                throw new Exception("Empty body sublocations results");

            foreach (var loc in bodySublocations)
                Console.WriteLine("{0} ({1})", loc.Name, loc.ID);

            int randomLocIndex = GetRandom(bodySublocations.Count);
            HealthItem randomLocation = bodySublocations[randomLocIndex];

            WriteHeaderMessage(string.Format("Sublocations symptoms for selected location {0}", randomLocation.Name));

            return randomLocation.ID;
        }

        static List<HealthSymptomSelector> LoadSublocationSymptoms(int subLocId)
        {
            List<HealthSymptomSelector> symptoms = _diagnosisClient.LoadSublocationSymptoms(subLocId, SelectorStatus.Man);

            if (symptoms == null || symptoms.Count == 0)
            {
                Console.WriteLine("Empty body sublocations symptoms results");
                return null;
            }

            WriteHeaderMessage("Body sublocations symptoms:");

            foreach (var sym in symptoms)
                Console.WriteLine(sym.Name);

            int randomSymptomIndex = GetRandom(symptoms.Count);

            randomSymptomIndex = GetRandom(symptoms.Count);

            HealthSymptomSelector randomSymptom = symptoms[randomSymptomIndex];

            WriteHeaderMessage(string.Format("Randomly selected symptom: {0}", randomSymptom.Name));

            List<HealthSymptomSelector> selectedSymptoms = new List<HealthSymptomSelector>();
            selectedSymptoms.Add(randomSymptom);

            LoadRedFlag(randomSymptom);

            return selectedSymptoms;
        }

        static List<int> LoadDiagnosis(List<HealthSymptomSelector> selectedSymptoms)
        {
            WriteHeaderMessage("Diagnosis");
            List<HealthDiagnosis> diagnosis = _diagnosisClient.LoadDiagnosis(selectedSymptoms.Select(x => x.ID).ToList(), Gender.Male, 1988);

            if (diagnosis == null || diagnosis.Count == 0)
            {
                WriteHeaderMessage(string.Format("No diagnosis results for symptom {0}", selectedSymptoms.First().Name));
                return null;
            }

            foreach (var d in diagnosis)
                Console.WriteLine("{0} - {1}% \nICD: {2}{3}\nSpecialisations : {4}\n", d.Issue.Name, d.Issue.Accuracy,d.Issue.Icd, d.Issue.IcdName, string.Join(",", d.Specialisation.Select(x => x.Name)));

            return diagnosis.Select(x => x.Issue.ID).ToList();
        }

        static void LoadSpecialisations(List<HealthSymptomSelector> selectedSymptoms)
        {
            WriteHeaderMessage("Specialisations");

            List<DiagnosedSpecialisation> specialisations = _diagnosisClient.LoadSpecialisations(selectedSymptoms.Select(x => x.ID).ToList(), Gender.Male, 1988);

            if (specialisations == null || specialisations.Count == 0)
            {
                WriteHeaderMessage(string.Format("No specialisations for symptom {0}", selectedSymptoms.First().Name));
                return;
            }

            foreach (var s in specialisations)
                Console.WriteLine("{0} - {1}%", s.Name, s.Accuracy);

        }

        static void LoadRedFlag(HealthSymptomSelector selectedSymptom)
        {
            string redFlag = string.Format("Symptom {0} has no red flag", selectedSymptom.Name);
            
            if(selectedSymptom.HasRedFlag)
                redFlag = _diagnosisClient.LoadRedFlag(selectedSymptom.ID);

            WriteHeaderMessage(redFlag);
        }

        static void LoadIssueInfo(int issueId)
        {
            HealthIssueInfo issueInfo = _diagnosisClient.LoadIssueInfo(issueId);
            WriteHeaderMessage("Issue info");
            Console.WriteLine(string.Format("Name: {0}", issueInfo.Name));
            Console.WriteLine(string.Format("Professional Name: {0}", issueInfo.ProfName));
            Console.WriteLine(string.Format("Synonyms: {0}", issueInfo.Synonyms));
            Console.WriteLine(string.Format("Short Description: {0}", issueInfo.DescriptionShort));
            Console.WriteLine(string.Format("Description: {0}",issueInfo.Description));
            Console.WriteLine(string.Format("Medical Condition: {0}", issueInfo.MedicalCondition));
            Console.WriteLine(string.Format("Treatment Description: {0}", issueInfo.TreatmentDescription));
            Console.WriteLine(string.Format("Possible symptoms: {0} \n\n", issueInfo.PossibleSymptoms));
        }

        static void LoadProposedSymptoms(List<HealthSymptomSelector> selectedSymptoms)
        {
            List<HealthItem> proposedSymptoms = _diagnosisClient.LoadProposedSymptoms(selectedSymptoms.Select(x => x.ID).ToList(), Gender.Male, 1988);

            if (proposedSymptoms == null || proposedSymptoms.Count == 0)
            {
                WriteHeaderMessage(string.Format("No proposed symptoms for selected symptom {0}", selectedSymptoms.First().Name));
                return;
            }

            WriteHeaderMessage(string.Format("Proposed symptoms: {0}", string.Join(",", proposedSymptoms.Select(x => x.Name))));
        }

        static void Simulate()
        {
            // Load body locations
            int selectedLocationID = LoadBodyLocations();

            // Load body sublocations
            int selectedSublocationID = LoadBodySublocations(selectedLocationID);

            // Load body sublocations symptoms
            List<HealthSymptomSelector> selectedSymptoms = LoadSublocationSymptoms(selectedSublocationID);

            // Load diagnosis
            List<int> diagnosis = LoadDiagnosis(selectedSymptoms);

            // Load specialisations
            LoadSpecialisations(selectedSymptoms);

            // Load issue info
            foreach (var issueId in diagnosis)
                LoadIssueInfo(issueId);

            // Load proposed symptoms
            LoadProposedSymptoms(selectedSymptoms);
        }
    }
}
