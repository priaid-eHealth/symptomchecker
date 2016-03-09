using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Priaid.Diagnosis.Client.Model
{
    public class HealthSymptomSelector : HealthItem
    {
        ///<summary>
        /// Professional name
        /// </summary>
        public String ProfName { get; set; }

        /// <summary>
        /// Rad flag indicator
        /// </summary>
        public bool HasRedFlag { get; set; }

        /// <summary>
        /// List of sublocation ids where this symptom is shown
        /// </summary>
        public List<int> HealthSymptomLocationIDs { get; set; }

        /// <summary>
        /// Symptom synonyms (comma separated)
        /// </summary>
        public List<string> Synonyms { get; set; }
    }
        
}
