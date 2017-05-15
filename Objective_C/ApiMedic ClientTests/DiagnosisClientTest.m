//
//  DiagnosisClientTest.m
//  ApiMedic Client
//
//  Created by aplimpton on 1.4.2017.
//  Copyright © 2017 Priaid. All rights reserved.
//

/*
 
 Redistribution and use in source and binary forms, with or without
 modification, are permitted provided that the following conditions are met:
 
 * Redistributions of source code must retain the above copyright notice, this
 list of conditions and the following disclaimer.
 
 * Redistributions in binary form must reproduce the above copyright notice,
 this list of conditions and the following disclaimer in the documentation
 and/or other materials provided with the distribution.
 
 * Neither the name of the author nor the names of its contributors may be used
 to endorse or promote products derived from this software without specific
 prior written permission.
 
 THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
 AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
 IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE
 FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
 DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
 SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
 CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY,
 OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 
 */

#import <XCTest/XCTest.h>
#import "../ApiMedic Client/Priaid.Diagnosis.Client/DiagnosisClient.h"

//////// The following header testing_passwords.h file is not included in source control. You must provide your own.
//////// It must define

// #define test_username @"your_username"
// #define test_password @"your_password"

//////// so the unit tests can run.

#import "testing_passwords.h"

/////////////////////////////// PARAMETERS FOR CONNECTION AND API TESTING





#define test_language @"en-gb"

//#define test_authServiceUrl @"https://authservice.priaid.ch/login"
//#define test_healthServiceUrl @"https://healthservice.priaid.ch"

#define test_authServiceUrl @"https://sandbox-authservice.priaid.ch/login"
#define test_healthServiceUrl @"https://sandbox-healthservice.priaid.ch"

#define test_issueid 0x1af
#define test_redflag_symptomid 10
#define test_gender 1
#define test_yearofbirth 1969
#define test_diagnosis_symptomid1 10
#define test_bodylocation 16
#define test_bodysublocation 36
#define test_locationid 16
#define test_selectedselectorstatus 0


@interface DiagnosisClientTest : XCTestCase

@end

@implementation DiagnosisClientTest

- (void)setUp {
    [super setUp];
    // Put setup code here. This method is called before the invocation of each test method in the class.
}

- (void)tearDown {
    // Put teardown code here. This method is called after the invocation of each test method in the class.
    [super tearDown];
}

- (void)testInit {

    DiagnosisClient* dc=[[DiagnosisClient alloc]
                         init:test_username password:test_password authServiceUrl:test_authServiceUrl language:test_language healthServiceUrl:test_healthServiceUrl];

    XCTAssertNotNil(dc,"DiagnosisClient init failed");
    XCTAssertTrue(dc.commandStatus==acsCreated,"DiagnosisClient should be in status acsCreated after initialization");
}

- (void)testauthorizeAccessToken {

    DiagnosisClient* dc=[[DiagnosisClient alloc]
                         init:test_username password:test_password authServiceUrl:test_authServiceUrl language:test_language healthServiceUrl:test_healthServiceUrl];
    
    XCTAssertNotNil(dc,"DiagnosisClient init failed");
    XCTAssertTrue(dc.commandStatus==acsCreated,"DiagnosisClient should be in status acsCreated after initialization");

    [dc authorizeAccessToken:^(DiagnosisClient * client, ApiMedicCommandStatus commandStatus, AccessToken* token) {
        XCTAssertNotNil(client,"DiagnosisClient should not be nil in authorizeAccessToken completion block");
        XCTAssertTrue(commandStatus==acsAuthorized,"Diagnosis authorizeAccessToken with test credentials should succeed");
        XCTAssertNotNil(token,"AccessToken should not be nil in authorizeAccessToken completion block if command succeeds");
    }];
    
}

- (void)testLoadSymptoms {
    
    bool __block completed=false;
   
    DiagnosisClient* dc=[[DiagnosisClient alloc]
                         init:test_username password:test_password authServiceUrl:test_authServiceUrl language:test_language healthServiceUrl:test_healthServiceUrl];
    
    XCTAssertNotNil(dc,"DiagnosisClient init failed");
    XCTAssertTrue(dc.commandStatus==acsCreated,"DiagnosisClient should be in status acsCreated after initialization");
    
    [dc authorizeAccessToken:^(DiagnosisClient * client, ApiMedicCommandStatus commandStatus, AccessToken* token) {
        XCTAssertNotNil(client,"DiagnosisClient should not be nil in authorizeAccessToken completion block");
        XCTAssertTrue(commandStatus==acsAuthorized,"Diagnosis authorizeAccessToken with test credentials should succeed");
        XCTAssertNotNil(token,"AccessToken should not be nil in authorizeAccessToken completion block if command succeeds");
        
        [client LoadSymptoms:^(DiagnosisClient * client, ApiMedicCommandStatus commandStatus, NSMutableArray<HealthItem *> *symptoms) {
            XCTAssertNotNil(client,"DiagnosisClient should not be nil in LoadSymptoms completion block");
            XCTAssertTrue(commandStatus==acsCompleted,"Diagnosis LoadSymptoms should succeed");
            XCTAssertNotNil(symptoms,"Symptoms should not be nil in LoadSymptoms completion block if command succeeds");
            
            XCTAssertTrue([symptoms count]>0,"Symptoms should not be empty in LoadSymptoms completion block if command succeeds");
            
            HealthItem* it=[symptoms objectAtIndex:0];
            
            XCTAssertNotNil(it,"First item of symptoms should not be nil in LoadSymptoms completion block if command succeeds");
            XCTAssertNotNil(it.Name,"First item Name should not be nil in LoadSymptoms completion block if command succeeds");
            
            
            completed=true;
            
        }];
        
        
    }];
    while (!completed)
    {
        [[NSRunLoop currentRunLoop] runUntilDate:[NSDate dateWithTimeIntervalSinceNow:1]];
    }
}

- (void)testLoadIssues {
    
    bool __block completed=false;
    
    DiagnosisClient* dc=[[DiagnosisClient alloc]
                         init:test_username password:test_password authServiceUrl:test_authServiceUrl language:test_language healthServiceUrl:test_healthServiceUrl];
    
    XCTAssertNotNil(dc,"DiagnosisClient init failed");
    XCTAssertTrue(dc.commandStatus==acsCreated,"DiagnosisClient should be in status acsCreated after initialization");
    
    [dc authorizeAccessToken:^(DiagnosisClient * client, ApiMedicCommandStatus commandStatus, AccessToken* token) {
        XCTAssertNotNil(client,"DiagnosisClient should not be nil in authorizeAccessToken completion block");
        XCTAssertTrue(commandStatus==acsAuthorized,"Diagnosis authorizeAccessToken with test credentials should succeed");
        XCTAssertNotNil(token,"AccessToken should not be nil in authorizeAccessToken completion block if command succeeds");
        
        [client LoadIssues:^(DiagnosisClient * client, ApiMedicCommandStatus commandStatus, NSMutableArray<HealthItem *> *symptoms) {
            XCTAssertNotNil(client,"DiagnosisClient should not be nil in LoadIssues completion block");
            XCTAssertTrue(commandStatus==acsCompleted,"Diagnosis LoadIssues should succeed");
            XCTAssertNotNil(symptoms,"Symptoms should not be nil in LoadIssues completion block if command succeeds");
            
            XCTAssertTrue([symptoms count]>0,"Symptoms should not be empty in LoadIssues completion block if command succeeds");
            
            HealthItem* it=[symptoms objectAtIndex:0];
            
            XCTAssertNotNil(it,"First item of symptoms should not be nil in LoadIssues completion block if command succeeds");
            XCTAssertNotNil(it.Name,"First item Name should not be nil in LoadIssues completion block if command succeeds");
            
            
            completed=true;
            
        }];
        
        
    }];
    while (!completed)
    {
        [[NSRunLoop currentRunLoop] runUntilDate:[NSDate dateWithTimeIntervalSinceNow:1]];
    }
}

- (void)testLoadIssueInfo {
    
    bool __block completed=false;
    
    DiagnosisClient* dc=[[DiagnosisClient alloc]
                         init:test_username password:test_password authServiceUrl:test_authServiceUrl language:test_language healthServiceUrl:test_healthServiceUrl];
    
    XCTAssertNotNil(dc,"DiagnosisClient init failed");
    XCTAssertTrue(dc.commandStatus==acsCreated,"DiagnosisClient should be in status acsCreated after initialization");
    
    [dc authorizeAccessToken:^(DiagnosisClient * client, ApiMedicCommandStatus commandStatus, AccessToken* token) {
        XCTAssertNotNil(client,"DiagnosisClient should not be nil in authorizeAccessToken completion block");
        XCTAssertTrue(commandStatus==acsAuthorized,"Diagnosis authorizeAccessToken with test credentials should succeed");
        XCTAssertNotNil(token,"AccessToken should not be nil in authorizeAccessToken completion block if command succeeds");
        
        [client LoadIssueInfo:^(DiagnosisClient * client, ApiMedicCommandStatus commandStatus, HealthIssueInfo* info) {
            XCTAssertNotNil(client,"DiagnosisClient should not be nil in LoadIssueInfo completion block");
            XCTAssertTrue(commandStatus==acsCompleted,"Diagnosis LoadIssueInfo should succeed");
            XCTAssertNotNil(info,"Info should not be nil in LoadIssueInfo completion block if command succeeds");
            
            XCTAssertNotNil(info.Name,"Info Name should not be nil in LoadIssueInfo completion block if command succeeds");
            XCTAssertNotNil(info.ProfName,"Info Name should not be nil in LoadIssueInfo completion block if command succeeds");
            
            completed=true;
            
        } issueId:test_issueid];
        
        
    }];
    while (!completed)
    {
        [[NSRunLoop currentRunLoop] runUntilDate:[NSDate dateWithTimeIntervalSinceNow:1]];
    }
}

- (void)testLoadDiagnosis {
    
    bool __block completed=false;
    
    DiagnosisClient* dc=[[DiagnosisClient alloc]
                         init:test_username password:test_password authServiceUrl:test_authServiceUrl language:test_language healthServiceUrl:test_healthServiceUrl];
    
    XCTAssertNotNil(dc,"DiagnosisClient init failed");
    XCTAssertTrue(dc.commandStatus==acsCreated,"DiagnosisClient should be in status acsCreated after initialization");
    
    [dc authorizeAccessToken:^(DiagnosisClient * client, ApiMedicCommandStatus commandStatus, AccessToken* token) {
        XCTAssertNotNil(client,"DiagnosisClient should not be nil in authorizeAccessToken completion block");
        XCTAssertTrue(commandStatus==acsAuthorized,"Diagnosis authorizeAccessToken with test credentials should succeed");
        XCTAssertNotNil(token,"AccessToken should not be nil in authorizeAccessToken completion block if command succeeds");
        
        NSMutableArray* selsym=[[NSMutableArray alloc] init];
        [selsym addObject:[[NSNumber alloc] initWithInt:test_diagnosis_symptomid1]];
        
        [client LoadDiagnosis:^(DiagnosisClient * client, ApiMedicCommandStatus commandStatus, NSMutableArray<HealthDiagnosis *> *diagnosis) {
            XCTAssertNotNil(client,"DiagnosisClient should not be nil in LoadDiagnosis completion block");
            XCTAssertTrue(commandStatus==acsCompleted,"Diagnosis LoadDiagnosis should succeed");
            XCTAssertNotNil(diagnosis,"Diagnosis should not be nil in LoadDiagnosis completion block if command succeeds");
            
            XCTAssertTrue([diagnosis count]>0,"Diagnosis should not be empty in LoadDiagnosis completion block if command succeeds");
            
            HealthDiagnosis* it=[diagnosis objectAtIndex:0];
            
            XCTAssertNotNil(it,"First item of diagnosis should not be nil in LoadDiagnosis completion block if command succeeds");
            XCTAssertNotNil(it.Issue,"First item Issue should not be nil in LoadDiagnosis completion block if command succeeds");
            
            
            completed=true;
            
        } selectedSymptoms: selsym gender:test_gender yearOfBirth:test_yearofbirth];
        
        
    }];
    while (!completed)
    {
        [[NSRunLoop currentRunLoop] runUntilDate:[NSDate dateWithTimeIntervalSinceNow:1]];
    }
}

- (void)testLoadSpecialisations {
    
    bool __block completed=false;
    
    DiagnosisClient* dc=[[DiagnosisClient alloc]
                         init:test_username password:test_password authServiceUrl:test_authServiceUrl language:test_language healthServiceUrl:test_healthServiceUrl];
    
    XCTAssertNotNil(dc,"DiagnosisClient init failed");
    XCTAssertTrue(dc.commandStatus==acsCreated,"DiagnosisClient should be in status acsCreated after initialization");
    
    [dc authorizeAccessToken:^(DiagnosisClient * client, ApiMedicCommandStatus commandStatus, AccessToken* token) {
        XCTAssertNotNil(client,"DiagnosisClient should not be nil in authorizeAccessToken completion block");
        XCTAssertTrue(commandStatus==acsAuthorized,"Diagnosis authorizeAccessToken with test credentials should succeed");
        XCTAssertNotNil(token,"AccessToken should not be nil in authorizeAccessToken completion block if command succeeds");
        
        NSMutableArray* selsym=[[NSMutableArray alloc] init];
        [selsym addObject:[[NSNumber alloc] initWithInt:test_diagnosis_symptomid1]];
        
        [client LoadSpecialisations:^(DiagnosisClient * client, ApiMedicCommandStatus commandStatus, NSMutableArray<DiagnosedSpecialisation *> *specialisations) {
            XCTAssertNotNil(client,"DiagnosisClient should not be nil in LoadSpecialisations completion block");
            XCTAssertTrue(commandStatus==acsCompleted,"Diagnosis LoadSpecialisations should succeed");
            XCTAssertNotNil(specialisations,"Specialisations should not be nil in LoadSpecialisations completion block if command succeeds");
            
            XCTAssertTrue([specialisations count]>0,"Specialisations should not be empty in LoadSpecialisations completion block if command succeeds");
            
            DiagnosedSpecialisation* it=[specialisations objectAtIndex:0];
            
            XCTAssertNotNil(it,"First item of specialisations should not be nil in LoadSpecialisations completion block if command succeeds");
            XCTAssertNotNil(it.Accuracy,"First item Issue should not be nil in LoadSpecialisations completion block if command succeeds");
            XCTAssertNotNil(it.Name,"First item Name should not be nil in LoadSpecialisations completion block if command succeeds");
            
            completed=true;
            
        } selectedSymptoms: selsym gender:test_gender yearOfBirth:test_yearofbirth];
        
        
    }];
    while (!completed)
    {
        [[NSRunLoop currentRunLoop] runUntilDate:[NSDate dateWithTimeIntervalSinceNow:1]];
    }
}


- (void)testLoadBodyLocations {
    
    bool __block completed=false;
    
    DiagnosisClient* dc=[[DiagnosisClient alloc]
                         init:test_username password:test_password authServiceUrl:test_authServiceUrl language:test_language healthServiceUrl:test_healthServiceUrl];
    
    XCTAssertNotNil(dc,"DiagnosisClient init failed");
    XCTAssertTrue(dc.commandStatus==acsCreated,"DiagnosisClient should be in status acsCreated after initialization");
    
    [dc authorizeAccessToken:^(DiagnosisClient * client, ApiMedicCommandStatus commandStatus, AccessToken* token) {
        XCTAssertNotNil(client,"DiagnosisClient should not be nil in authorizeAccessToken completion block");
        XCTAssertTrue(commandStatus==acsAuthorized,"Diagnosis authorizeAccessToken with test credentials should succeed");
        XCTAssertNotNil(token,"AccessToken should not be nil in authorizeAccessToken completion block if command succeeds");
        
        [client LoadBodyLocations:^(DiagnosisClient * client, ApiMedicCommandStatus commandStatus, NSMutableArray<HealthItem *> *symptoms) {
            XCTAssertNotNil(client,"DiagnosisClient should not be nil in LoadBodyLocations completion block");
            XCTAssertTrue(commandStatus==acsCompleted,"Diagnosis LoadBodyLocations should succeed");
            XCTAssertNotNil(symptoms,"Symptoms should not be nil in LoadBodyLocations completion block if command succeeds");
            
            XCTAssertTrue([symptoms count]>0,"Symptoms should not be empty in LoadBodyLocations completion block if command succeeds");
            
            HealthItem* it=[symptoms objectAtIndex:0];
            
            XCTAssertNotNil(it,"First item of symptoms should not be nil in LoadBodyLocations completion block if command succeeds");
            XCTAssertNotNil(it.Name,"First item Name should not be nil in LoadBodyLocations completion block if command succeeds");
            
            completed=true;
            
        }];
        
        
    }];
    while (!completed)
    {
        [[NSRunLoop currentRunLoop] runUntilDate:[NSDate dateWithTimeIntervalSinceNow:1]];
    }
}

- (void)testLoadBodySubLocations {
    
    bool __block completed=false;
    
    DiagnosisClient* dc=[[DiagnosisClient alloc]
                         init:test_username password:test_password authServiceUrl:test_authServiceUrl language:test_language healthServiceUrl:test_healthServiceUrl];
    
    XCTAssertNotNil(dc,"DiagnosisClient init failed");
    XCTAssertTrue(dc.commandStatus==acsCreated,"DiagnosisClient should be in status acsCreated after initialization");
    
    [dc authorizeAccessToken:^(DiagnosisClient * client, ApiMedicCommandStatus commandStatus, AccessToken* token) {
        XCTAssertNotNil(client,"DiagnosisClient should not be nil in authorizeAccessToken completion block");
        XCTAssertTrue(commandStatus==acsAuthorized,"Diagnosis authorizeAccessToken with test credentials should succeed");
        XCTAssertNotNil(token,"AccessToken should not be nil in authorizeAccessToken completion block if command succeeds");
        
        [client LoadBodySubLocations:^(DiagnosisClient * client, ApiMedicCommandStatus commandStatus, NSMutableArray<HealthItem *> *symptoms) {
            XCTAssertNotNil(client,"DiagnosisClient should not be nil in LoadBodySubLocations completion block");
            XCTAssertTrue(commandStatus==acsCompleted,"Diagnosis LoadBodySubLocations should succeed");
            XCTAssertNotNil(symptoms,"Symptoms should not be nil in LoadBodySubLocations completion block if command succeeds");
            
            XCTAssertTrue([symptoms count]>0,"Symptoms should not be empty in LoadBodySubLocations completion block if command succeeds");
            
            HealthItem* it=[symptoms objectAtIndex:0];
            
            XCTAssertNotNil(it,"First item of symptoms should not be nil in LoadBodySubLocations completion block if command succeeds");
            XCTAssertNotNil(it.Name,"First item Name should not be nil in LoadBodySubLocations completion block if command succeeds");
            
            completed=true;
            
        } bodyLocationId:test_bodylocation];
        
        
    }];
    while (!completed)
    {
        [[NSRunLoop currentRunLoop] runUntilDate:[NSDate dateWithTimeIntervalSinceNow:1]];
    }
}

- (void)testLoadSublocationSymptoms {
    
    bool __block completed=false;
    
    DiagnosisClient* dc=[[DiagnosisClient alloc]
                         init:test_username password:test_password authServiceUrl:test_authServiceUrl language:test_language healthServiceUrl:test_healthServiceUrl];
    
    XCTAssertNotNil(dc,"DiagnosisClient init failed");
    XCTAssertTrue(dc.commandStatus==acsCreated,"DiagnosisClient should be in status acsCreated after initialization");
    
    [dc authorizeAccessToken:^(DiagnosisClient * client, ApiMedicCommandStatus commandStatus, AccessToken* token) {
        XCTAssertNotNil(client,"DiagnosisClient should not be nil in authorizeAccessToken completion block");
        XCTAssertTrue(commandStatus==acsAuthorized,"Diagnosis authorizeAccessToken with test credentials should succeed");
        XCTAssertNotNil(token,"AccessToken should not be nil in authorizeAccessToken completion block if command succeeds");
        
        [client LoadSubLocationSymptoms:^(DiagnosisClient * client, ApiMedicCommandStatus commandStatus, NSMutableArray<HealthSymptomSelector *> *symptoms) {
            XCTAssertNotNil(client,"DiagnosisClient should not be nil in LoadSubLocationSymptoms completion block");
            XCTAssertTrue(commandStatus==acsCompleted,"Diagnosis LoadSubLocationSymptoms should succeed");
            XCTAssertNotNil(symptoms,"Symptoms should not be nil in LoadSubLocationSymptoms completion block if command succeeds");
            
            XCTAssertTrue([symptoms count]>0,"Symptoms should not be empty in LoadSubLocationSymptoms completion block if command succeeds");
            
            HealthSymptomSelector* it=[symptoms objectAtIndex:0];
            
            XCTAssertNotNil(it,"First item of symptoms should not be nil in LoadSubLocationSymptoms completion block if command succeeds");
            XCTAssertNotNil(it.ProfName,"First item ProfName should not be nil in LoadSubLocationSymptoms completion block if command succeeds");
            XCTAssertNotNil(it.HealthSymptomLocationIDs,"First item HealthSymptomLocationIDs should not be nil in LoadSubLocationSymptoms completion block if command succeeds");
            XCTAssertNotNil(it.Synonyms,"First item Synonyms should not be nil in LoadSubLocationSymptoms completion block if command succeeds");
            
            completed=true;
            
        } locationId: test_locationid selectedSelectorStatus: test_selectedselectorstatus];
        
    }];
    while (!completed)
    {
        [[NSRunLoop currentRunLoop] runUntilDate:[NSDate dateWithTimeIntervalSinceNow:1]];
    }
}

- (void)testLoadProposedSymptoms {
    
    bool __block completed=false;
    
    DiagnosisClient* dc=[[DiagnosisClient alloc]
                         init:test_username password:test_password authServiceUrl:test_authServiceUrl language:test_language healthServiceUrl:test_healthServiceUrl];
    
    XCTAssertNotNil(dc,"DiagnosisClient init failed");
    XCTAssertTrue(dc.commandStatus==acsCreated,"DiagnosisClient should be in status acsCreated after initialization");
    
    [dc authorizeAccessToken:^(DiagnosisClient * client, ApiMedicCommandStatus commandStatus, AccessToken* token) {
        XCTAssertNotNil(client,"DiagnosisClient should not be nil in authorizeAccessToken completion block");
        XCTAssertTrue(commandStatus==acsAuthorized,"Diagnosis authorizeAccessToken with test credentials should succeed");
        XCTAssertNotNil(token,"AccessToken should not be nil in authorizeAccessToken completion block if command succeeds");
        
        NSMutableArray* selsym=[[NSMutableArray alloc] init];
        [selsym addObject:[[NSNumber alloc] initWithInt:test_diagnosis_symptomid1]];

        
        [client LoadProposedSymptoms:^(DiagnosisClient * client, ApiMedicCommandStatus commandStatus, NSMutableArray<HealthItem *> *symptoms) {
            XCTAssertNotNil(client,"DiagnosisClient should not be nil in LoadProposedSymptoms completion block");
            XCTAssertTrue(commandStatus==acsCompleted,"Diagnosis LoadProposedSymptoms should succeed");
            XCTAssertNotNil(symptoms,"Symptoms should not be nil in LoadProposedSymptoms completion block if command succeeds");
            XCTAssertTrue([symptoms count]>0,"Symptoms should not be empty in LoadProposedSymptoms completion block if command succeeds");
            
            HealthItem* it=[symptoms objectAtIndex:0];
            
            XCTAssertNotNil(it,"First item of symptoms should not be nil in LoadProposedSymptoms completion block if command succeeds");
            XCTAssertNotNil(it.Name,"First item Name should not be nil in LoadProposedSymptoms completion block if command succeeds");
            
            completed=true;
            
        } selectedSymptoms: selsym gender:test_gender yearOfBirth:test_yearofbirth];
        
    }];
    while (!completed)
    {
        [[NSRunLoop currentRunLoop] runUntilDate:[NSDate dateWithTimeIntervalSinceNow:1]];
    }
}


- (void)testLoadRedFlag {
    
    bool __block completed=false;
    
    DiagnosisClient* dc=[[DiagnosisClient alloc]
                         init:test_username password:test_password authServiceUrl:test_authServiceUrl language:test_language healthServiceUrl:test_healthServiceUrl];
    
    XCTAssertNotNil(dc,"DiagnosisClient init failed");
    XCTAssertTrue(dc.commandStatus==acsCreated,"DiagnosisClient should be in status acsCreated after initialization");
    
    [dc authorizeAccessToken:^(DiagnosisClient * client, ApiMedicCommandStatus commandStatus, AccessToken* token) {
        XCTAssertNotNil(client,"DiagnosisClient should not be nil in authorizeAccessToken completion block");
        XCTAssertTrue(commandStatus==acsAuthorized,"Diagnosis authorizeAccessToken with test credentials should succeed");
        XCTAssertNotNil(token,"AccessToken should not be nil in authorizeAccessToken completion block if command succeeds");
        
        [client LoadRedFlag:^(DiagnosisClient * client, ApiMedicCommandStatus commandStatus, NSString* redflag) {
            XCTAssertNotNil(client,"DiagnosisClient should not be nil in LoadRedFlag completion block");
            XCTAssertTrue(commandStatus==acsCompleted,"Diagnosis LoadRedFlag should succeed");
            XCTAssertNotNil(redflag,"RedFlag should not be nil in LoadRedFlag completion block if command succeeds");
            
            completed=true;
            
        } symptomId:test_redflag_symptomid];
        
        
    }];
    while (!completed)
    {
        [[NSRunLoop currentRunLoop] runUntilDate:[NSDate dateWithTimeIntervalSinceNow:1]];
    }
}


@end
