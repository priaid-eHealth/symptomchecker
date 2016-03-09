<?php

require 'token_generator.php';
require 'priaid_client.php';

class Demo
{
    private $config;
    private $diagnosisClient;
    
    function __construct()
    {
        $this->config = parse_ini_file("config.ini");
    }
    
    private function checkRequiredParameters()
    {
        $pass = true;
        
        if (!isset($this->config['username']))
        {
            $pass = false;
            print "You didn't set username in config.ini" ;
        }

        if (!isset($this->config['password']))
        {
            $pass = false;
            print "You didn't set password in config.ini" ;
        }
            
        if (!isset($this->config['authServiceUrl']))
        {
            $pass = false;
            print "You didn't set authServiceUrl in config.ini" ;
        }

        if (!isset($this->config['healthServiceUrl']))
        {
            $pass = false;
            print "You didn't set healthserviceUrl in config.ini" ;
        }
         
        return $pass;
    }
    
    public function simulate()
    {
        if (!$this->checkRequiredParameters())
            return;
        
        $tokenGenerator = new TokenGenerator($this->config['username'],$this->config['password'],$this->config['authServiceUrl']);
        $token = $tokenGenerator->loadToken();
        
        if (!isset($token))
            exit();

        $this->diagnosisClient = new DiagnosisClient($token, $this->config['healthServiceUrl'], 'en-gb');
        print('<html><body>');
        print('<h3>Body locations</h3>');
        $bodyLocations = $this->diagnosisClient->loadBodyLocations();
        if (!isset($bodyLocations))
            exit();
        $this->printSimpleObject($bodyLocations);
        
        // get random body location
        $locRandomIndex = rand(0, count($bodyLocations)-1);
        $locRandomId = $bodyLocations[$locRandomIndex]['ID'];
        $locRandomName = $bodyLocations[$locRandomIndex]['Name'];
        $bodySublocations = $this->diagnosisClient->loadBodySublocations($locRandomId);
        if (!isset($bodySublocations))
            exit();
        print("<h3>Body Subocations for $locRandomName($locRandomId)</h3>");
        $this->printSimpleObject($bodySublocations);
        
        // get random body sublocation
        $sublocRandomIndex = rand(0, count($bodySublocations)-1);
        $sublocRandomId = $bodySublocations[$sublocRandomIndex]['ID'];
        $sublocRandomName = $bodySublocations[$sublocRandomIndex]['Name'];
        $symptoms = $this->diagnosisClient->loadSublocationSymptoms($sublocRandomId,'man');
        print("<h3>Symptoms in body sublocation $sublocRandomName($sublocRandomId)</h3>");
        if (!isset($symptoms))
            exit();
        if (count($symptoms) == 0)
            die("No symptoms for selected body sublocation");
        
        $this->printSimpleObject($symptoms);
        
        // get diagnosis
        $randomSymptomIndex = rand(0, count($symptoms)-1);
        $randomSymptomId = $symptoms[$randomSymptomIndex]['ID'];
        $randomSymptomName = $symptoms[$randomSymptomIndex]['Name'];
        $selectedSymptoms = array($randomSymptomId);
        $diagnosis = $this->diagnosisClient->loadDiagnosis($selectedSymptoms, 'male', 1988);
        if (!isset($diagnosis))
            exit();
        print("<h3>Calculated diagnosis for $randomSymptomName($randomSymptomId)</h3>");
        $this->printDiagnosis($diagnosis);
        
        // get specialisations
        $specialisations = $this->diagnosisClient->loadSpecialisations($selectedSymptoms, 'male', 1988);
        if (!isset($specialisations))
            exit();
        print("<h3>Calculated specialisations for $randomSymptomName($randomSymptomId)</h3>");
        $this->printSpecialisations($specialisations);
        
        // get proposed symptoms
        $proposedSymptoms = $this->diagnosisClient->loadProposedSymptoms($selectedSymptoms, 'male', 1988);
        if (!isset($proposedSymptoms))
            exit();
        print("<h3>Proposed symptoms for selected $randomSymptomName($randomSymptomId)</h3>");
        $this->printSimpleObject($proposedSymptoms);
        
        // get red flag text
        $redFlagText = $this->diagnosisClient->loadRedFlag($randomSymptomId);
        if (!isset($redFlagText))
            exit();
        print("<h3>Red flag text for selected $randomSymptomName($randomSymptomId)</h3>");
        print($redFlagText);
        
        // get issue info
        reset($diagnosis);
        while (list($key, $val) = each($diagnosis)) {
            $this->loadIssueInfo($val['Issue']['ID']);
        }        
        print('</body></html>');
    }
    
    private function loadIssueInfo($issueId)
    {
        $issueInfo = $this->diagnosisClient->loadIssueInfo($issueId);
        if (!isset($issueInfo))
            exit();
        $issueName = $issueInfo['Name'];
        print("<h3>Info for $issueName</h3>");
        print "<pre>";
        echo "\n","<b>Name:</b>\t",$issueName;
        echo "\n","<b>Professional Name:</b>\t",$issueInfo['ProfName'];
        echo "\n","<b>Synonyms:</b>\t",$issueInfo['Synonyms'];
        echo "\n","<b>Short Description:</b>\t",$issueInfo['DescriptionShort'];
        echo "\n","<b>Description:</b>\t",$issueInfo['Description'];
        echo "\n","<b>Medical Condition:</b>\t",$issueInfo['MedicalCondition'];
        echo "\n","<b>Treatment Description:</b>\t",$issueInfo['TreatmentDescription'];
        echo "\n","<b>Possible symptoms:</b>\t",$issueInfo['PossibleSymptoms'];
        print "</pre>";
    }
    
    private function printDiagnosis($object)
    {
        print "<pre>" ;
        print "<b>ID\tName</b>";
        array_map(function ($issue) {
            echo "\n", $issue['Issue']['ID'], "\t", $issue['Issue']['Name']," (", $issue['Issue']['Accuracy'],"%)\n";
            echo "<b>Specialisations</b> -> ";
            array_map(function ($spec)
            {
              echo $spec['Name'],"(",$spec['ID'],")", "\t";
            }, $issue['Specialisation']);
            echo "\n";
        }, $object);
        print "</pre>" ; 
    }
    
    private function printSpecialisations($object)
    {
        print "<pre>" ;
        print "<b>ID\tName</b>";
        array_map(function ($specialisation) {
            echo "\n", $specialisation['ID'], "\t", $specialisation['Name']," (", $specialisation['Accuracy'],"%)";
        }, $object);
        print "</pre>" ; 
    }
    
    private function printSimpleObject($object)
    {
        print "<pre>";
        print "<b>ID\tName</b>";
        array_map(function ($var) {
            echo "\n", $var['ID'], "\t", $var['Name'];
        }, $object);
        print "</pre>" ; 
    }
}

$demo = new Demo();
$demo->simulate();

?>