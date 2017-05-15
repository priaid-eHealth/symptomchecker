using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Priaid.Diagnosis.Client.Model
{
    public class HealthDiagnosis
    {
        /// <summary>
        /// Diagnosed issue
        /// </summary>
        public DiagnosedIssue Issue { get; set; }

        /// <summary>
        /// List of suggested doctor specialisations for this issue
        /// </summary>
        public List<MatchedSpecialisation> Specialisation { get; set; }
    }

    public class DiagnosedIssue : HealthItem
    {
        /// <summary>
        /// ICD code
        /// </summary>
        public string Icd { get; set; }
        
        /// <summary>
        /// ICD name
        /// </summary>
        public string IcdName { get; set; }
        
        /// <summary>
        /// Profesional name
        /// </summary>
        public string ProfName { get; set; }

        /// <summary>
        /// Probability for the issue in %
        /// </summary>
        public float Accuracy { get; set; }
    }

    public class MatchedSpecialisation : HealthItem
    {
        /// <summary>
        /// ID of specialisation
        /// </summary>
        public int SpecialistID { get; set; }
    }
	
	public class DiagnosedSpecialisation : HealthItem
    {
        /// <summary>
        /// Probability for the specialisation in %
        /// </summary>
        public float Accuracy { get; set; }
    }
}
