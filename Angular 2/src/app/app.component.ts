import { Component } from '@angular/core';
import { ApiService } from '../provider/apiService';
import { Config } from '../provider/config';
interface langObject {
  name:string;
  value:string;
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {

  issues: string;
  issuesConfig: string;
  issuesError: string;

  issueInfo: string;
  issueInfoConfig: string;
  issueInfoError: string;
  issueId : string = "237";

  diagnosis: string ;
  diagnosisConfig: string;
  diagnosisError: string;

  specialisations:string ;
  specialisationsConfig: string;
  specialisationsError: string ;

  proposedSymptoms: string;
  proposedSymptomsConfig: string;
  proposedSymptomsError: string;

  bodyLocations: string;
  bodyLocationsConfig: string;
  bodyLocationsError : string;


  bodySublocations :string;
  bodySublocationsConfig: string;
  bodySublocationsError :string;
  bodyLocationId :number= 16;

  bodySublocationSymptoms :string;
  bodySublocationSymptomsConfig :string;
  bodySublocationSymptomsError: string;
  bodySublocationId: number = 0;

  redFlagText: string;
  redFlagTextConfig: string;
  redFlagTextError: string;
  symptomId: number = 238;

  selectedSymptoms = '13';
  gender = {
    value: 'male'
  }
  yearOfBirth = 1988;
  selectorStatus = {
    value: 'man'
  }

  symptoms: string;
  symptomsConfig: string;
  symptomsError: string;
  lang: langObject;
  format: any;
  formats: any[] = [{value:"json",name:"json"},{value:"xml",name:"xml"}]
  languages: langObject[] = [{value:"en-gb",name:"en-gb"},{value:"de-ch",name:"de-ch"},{value:"fr-fr",name:"fr-fr"},{value:"it-it",name:"it-it"},{value:"es-es",name:"es-es"},{value:"ar-sa",name:"ar-sa"},{value:"ru-ru",name:"ru-ru"},{value:"tr-tr",name:"tr-tr"},{value:"sr-sp",name:"sr-sp"},{value:"sk-sk",name:"sk-sk"}]
  token: string;

  constructor(public apiService: ApiService, public config: Config) {
  	this.config.setLanguage("en-gb");
    this.config.setFormat("json");
  }

  doTextareaValueChange(ev) {
    try {
      this.token = ev.target.value;
      this.config.setToken(this.token);
    } catch(e) {
      console.info('could not set textarea-value');
    }
  }

  changeLanguage(value): void {
  	this.lang = value;
  	let obj = JSON.parse(value);
  	this.config.setLanguage(obj.value);
  }

  changeFormat(value): void {
  	this.format = value;
  	let obj =  JSON.parse(value)
  	this.config.setFormat(obj.value);
  }

  loadSymptoms() {
    this.symptoms = 'loading data from web service...';
    this.apiService.loadSymptoms()
    .subscribe(
          data => { 
            if(this.config.getFormat() == "json")
              this.symptoms = JSON.parse(data["_body"]) != '' ? JSON.parse(data["_body"]) : 'No results found'
            else
              this.symptoms = data["_body"] != '' ? data["_body"] : 'No results found'

            this.symptomsConfig = this.config.getConfig();;
            this.symptomsError = " ";
          },
          error => {
            this.symptoms = " "
            this.symptomsConfig = " ";
            let error_info = {
              "data" : error["_body"],
              "status": error["status"],
              "config": this.config.getConfig(),
              "statusText": error["statusText"]
            }
            this.symptomsError = JSON.parse(JSON.stringify(error_info));
          },
          () => {}
    )
  }

  loadIssues(){

    this.issues = 'loading data from web service...';
    this.apiService.loadIssues()
    .subscribe(
      data => {
        if(this.config.getFormat() == "json")
          this.issues = JSON.parse(data["_body"]) != '' ? JSON.parse(data["_body"]) : 'No results found'
        else 
          this.issues = data["_body"] != '' ? data["_body"] : 'No results found'
        let demo_Config = this.config.getConfig();
        demo_Config["url"] = data["url"];
        demo_Config["URL"] = data["url"];
        this.config.setConfig(demo_Config);
        this.issuesConfig = this.config.getConfig();
        this.issuesError = " ";},
      error => {
        this.issues = " "
        this.issuesConfig = " ";
        let error_info = {
          "data" : error["_body"],
          "status": error["status"],
          "config": this.config.getConfig(),
          "statusText": error["statusText"]
        }
        this.issuesError = JSON.parse(JSON.stringify(error_info));
      },
      () => {}
      )
  }

  loadIssueInfo(issueId) {

    this.symptoms = 'loading data from web service...';
    this.apiService.loadIssueInfo(issueId)
    .subscribe(
      data => {
        if(this.config.getFormat() == "json")
          this.issueInfo = JSON.parse(data["_body"]) != '' ? JSON.parse(data["_body"]) : 'No results found'
        else
          this.issueInfo = data["_body"] != '' ? data["_body"] : 'No results found'
        let demo_Config = this.config.getConfig();
        demo_Config["url"] = data["url"];
        demo_Config["URL"] = data["url"];
        this.config.setConfig(demo_Config);
        this.issueInfoConfig = this.config.getConfig();;
        this.issueInfoError = " ";},
      error => {
        this.issueInfo = " "
        this.issueInfoConfig = " ";
        let error_info = {
          "data" : error["_body"],
          "status": error["status"],
          "config": this.config.getConfig(),
          "statusText": error["statusText"]
        }
        this.issueInfoError = JSON.parse(JSON.stringify(error_info));
      },
      () => {}
      )
  }

  loadDiagnosis(selectedSymptoms,gender,yearOfBirth) {

    this.symptoms = 'loading data from web service...';
    this.apiService.loadDiagnosis(selectedSymptoms,gender,yearOfBirth)
    .subscribe(
      data => {
        if(this.config.getFormat() == "json")
          this.diagnosis = JSON.parse(data["_body"]) != '' ? JSON.parse(data["_body"]) : 'No results found'
        else
          this.diagnosis = data["_body"] != '' ? data["_body"] : 'No results found'
        let demo_Config = this.config.getConfig();
        demo_Config["url"] = data["url"];
        demo_Config["URL"] = data["url"];
        this.config.setConfig(demo_Config);
        this.diagnosisConfig = this.config.getConfig();;
        this.diagnosisError = " ";},
      error => {
        this.diagnosis = " "
        this.diagnosisConfig = " ";
        let error_info = {
          "data" : error["_body"],
          "status": error["status"],
          "config": this.config.getConfig(),
          "statusText": error["statusText"]
        }
        this.diagnosisError = JSON.parse(JSON.stringify(error_info));
      },
      () => {}
      )
  }

  loadSpecialisations(selectedSymptoms,gender,yearOfBirth) {

    this.symptoms = 'loading data from web service...';
    this.apiService.loadSpecialisations(selectedSymptoms,gender,yearOfBirth)
    .subscribe(
      data => {
        if(this.config.getFormat() == "json")
          this.specialisations = JSON.parse(data["_body"]) != '' ? JSON.parse(data["_body"]) : 'No results found'
        else
          this.specialisations = data["_body"] != '' ? data["_body"] : 'No results found'
        let demo_Config = this.config.getConfig();
        demo_Config["url"] = data["url"];
        demo_Config["URL"] = data["url"];
        this.config.setConfig(demo_Config);
        this.specialisationsConfig = this.config.getConfig();;
        this.specialisationsError = " ";},
      error => {
        this.specialisations = " "
        this.specialisationsConfig = " ";
        let error_info = {
          "data" : error["_body"],
          "status": error["status"],
          "config": this.config.getConfig(),
          "statusText": error["statusText"]
        }
        this.specialisationsError = JSON.parse(JSON.stringify(error_info));
      },
      () => {}
      )
  }

  loadProposedSymptoms(selectedSymptoms,gender,yearOfBirth) {

    this.symptoms = 'loading data from web service...';
    this.apiService.loadProposedSymptoms(selectedSymptoms,gender,yearOfBirth)
    .subscribe(
      data => {
        if(this.config.getFormat() == "json")
          this.proposedSymptoms = JSON.parse(data["_body"]) != '' ? JSON.parse(data["_body"]) : 'No results found'
        else
          this.proposedSymptoms = data["_body"] != '' ? data["_body"] : 'No results found'
        let demo_Config = this.config.getConfig();
        demo_Config["url"] = data["url"];
        demo_Config["URL"] = data["url"];
        this.config.setConfig(demo_Config);
        this.proposedSymptomsConfig = this.config.getConfig();;
        this.proposedSymptomsError = " ";},
      error => {
        this.proposedSymptoms = " "
        this.proposedSymptomsConfig = " ";
        let error_info = {
          "data" : error["_body"],
          "status": error["status"],
          "config": this.config.getConfig(),
          "statusText": error["statusText"]
        }
        this.proposedSymptomsError = JSON.parse(JSON.stringify(error_info));
      },
      () => {}
      )
  }

  loadBodyLocations() {

    this.symptoms = 'loading data from web service...';
    this.apiService.loadBodyLocations()
    .subscribe(
      data => {
        if(this.config.getFormat() == "json")
          this.bodyLocations = JSON.parse(data["_body"]) != '' ? JSON.parse(data["_body"]) : 'No results found'
        else
          this.bodyLocations = data["_body"] != '' ? data["_body"] : 'No results found'
        let demo_Config = this.config.getConfig();
        demo_Config["url"] = data["url"];
        demo_Config["URL"] = data["url"];
        this.config.setConfig(demo_Config);
        this.bodyLocationsConfig = this.config.getConfig();;
        this.bodyLocationsError = " ";},
      error => {
        this.bodyLocations = " "
        this.bodyLocationsConfig = " ";
        let error_info = {
          "data" : error["_body"],
          "status": error["status"],
          "config": this.config.getConfig(),
          "statusText": error["statusText"]
        }
        this.bodyLocationsError = JSON.parse(JSON.stringify(error_info));
      },
      () => {}
      )
  }

  loadBodySublocations(bodyLocationId) {

    this.symptoms = 'loading data from web service...';
    this.apiService.loadBodySublocations(bodyLocationId)
    .subscribe(
      data => {
        if(this.config.getFormat() == "json")
          this.bodySublocations = JSON.parse(data["_body"]) != '' ? JSON.parse(data["_body"]) : 'No results found'
        else
          this.bodySublocations = data["_body"] != '' ? data["_body"] : 'No results found'
        let demo_Config = this.config.getConfig();
        demo_Config["url"] = data["url"];
        demo_Config["URL"] = data["url"];
        this.config.setConfig(demo_Config);
        this.bodySublocationsConfig = this.config.getConfig();;
        this.bodySublocationsError = " ";},
      error => {
        this.bodySublocations = " "
        this.bodySublocationsConfig = " ";
        let error_info = {
          "data" : error["_body"],
          "status": error["status"],
          "config": this.config.getConfig(),
          "statusText": error["statusText"]
        }
        this.bodySublocationsError = JSON.parse(JSON.stringify(error_info));
      },
      () => {}
      )
  }

  loadBodySublocationSymptoms(bodySublocationId,selectorStatus) {

     this.symptoms = 'loading data from web service...';
     this.apiService.loadBodySublocationSymptoms(bodySublocationId,selectorStatus)
      .subscribe(
        data => {
          if(this.config.getFormat() == "json")
            this.bodySublocationSymptoms = JSON.parse(data["_body"]) != '' ? JSON.parse(data["_body"]) : 'No results found'
          else
            this.bodySublocationSymptoms = data["_body"] != '' ? data["_body"] : 'No results found'
          let demo_Config = this.config.getConfig();
          demo_Config["url"] = data["url"];
          demo_Config["URL"] = data["url"];
          this.config.setConfig(demo_Config);
          this.bodySublocationSymptomsConfig = this.config.getConfig();;
          this.bodySublocationSymptomsError = " ";},
        error => {
          this.bodySublocationSymptoms = " "
          this.bodySublocationSymptomsConfig = " ";
          let error_info = {
            "data" : error["_body"],
            "status": error["status"],
            "config": this.config.getConfig(),
            "statusText": error["statusText"]
          }
          this.bodySublocationSymptomsError = JSON.parse(JSON.stringify(error_info));
        },
        () => {}
        )
  }

  loadRedFlagText(symptomId) {

     this.symptoms = 'loading data from web service...';
     this.apiService.loadRedFlagText(symptomId)
      .subscribe(
        data => {
          if(this.config.getFormat() == "json")
            this.redFlagText = JSON.parse(data["_body"]) != '' ? JSON.parse(data["_body"]) : 'No results found'
          else
            this.redFlagText = data["_body"] != '' ? data["_body"] : 'No results found'
          let demo_Config = this.config.getConfig();
          demo_Config["url"] = data["url"];
          demo_Config["URL"] = data["url"];
          this.config.setConfig(demo_Config);
          this.redFlagTextConfig = this.config.getConfig();;
          this.redFlagTextError = " ";},
        error => {
          this.redFlagText = " "
          this.redFlagTextConfig = " ";
          let error_info = {
            "data" : error["_body"],
            "status": error["status"],
            "config": this.config.getConfig(),
            "statusText": error["statusText"]
          }
          this.redFlagTextError = JSON.parse(JSON.stringify(error_info));
        },
        () => {}
        )
  }
}
