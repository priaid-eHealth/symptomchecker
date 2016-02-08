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
        public List<HealthItem> Specialisation { get; set; }
    }

    public class DiagnosedIssue : HealthItem
    {
        /// <summary>
        /// Probability for the issue in %
        /// </summary>
        public float Accuracy { get; set; }
    }
}
