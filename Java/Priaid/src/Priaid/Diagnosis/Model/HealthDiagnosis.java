package Priaid.Diagnosis.Model;

import java.util.List;

public class HealthDiagnosis
{
    /// <summary>
    /// Diagnosed issue
    /// </summary>
    public DiagnosedIssue Issue;
    
    /// <summary>
    /// List of suggested doctor specialisations for this issue
    /// </summary>
    public List<MatchedSpecialisation> Specialisation;
}



