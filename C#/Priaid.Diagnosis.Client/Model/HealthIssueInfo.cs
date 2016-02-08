using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Priaid.Diagnosis.Client.Model
{
    public class HealthIssueInfo
    {
        /// <summary>
        /// Issue name
        /// </summary>
        public string Name { get; set; }
        /// <summary>
        /// Issue professional name
        /// </summary>
        public string ProfName { get; set; }
        /// <summary>
        /// Issue short description
        /// </summary>
        public string DescriptionShort { get; set; }
        /// <summary>
        /// Issue description
        /// </summary>
        public string Description { get; set; }
        /// <summary>
        /// Medical condition
        /// </summary>
        public string MedicalCondition { get; set; }
        /// <summary>
        /// Treatment description
        /// </summary>
        public string TreatmentDescription { get; set; }
        /// <summary>
        /// Issue synonyms (comma separated)
        /// </summary>
        public string Synonyms { get; set; }
        /// <summary>
        /// Possible symptoms (comma separated)
        /// </summary>
        public string PossibleSymptoms { get; set; }
    }
}
