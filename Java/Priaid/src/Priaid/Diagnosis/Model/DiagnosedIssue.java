package Priaid.Diagnosis.Model;

public class DiagnosedIssue extends HealthItem{
	
	/// <summary>
    /// ICD code
    /// </summary>
    public String Icd;
    
    /// <summary>
    /// ICD name
    /// </summary>
    public String IcdName;
    
    /// <summary>
    /// Profesional name
    /// </summary>
    public String ProfName;
    
	/// <summary>
    /// Probability for the issue in %
    /// </summary>
    public float Accuracy;
    
    
    public float Ranking;
    
    
}
