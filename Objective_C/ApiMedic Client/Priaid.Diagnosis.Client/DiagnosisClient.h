//
//  DiagnosisClient.h
//  ApiMedic Client
//
//  Created by aplimpton on 31.3.2017.
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

#import <Foundation/Foundation.h>
#import "Model/AccessToken.h"
#import "Model/HealthItem.h"
#import "Model/HealthIssueInfo.h"
#import "Model/HealthDiagnosis.h"
#import "Model/Gender.h"
#import "Model/SelectorStatus.h"
#import "Model/HealthSymptomSelector.h"
#import "JSON Encoder/KVCBaseObject.h"

// Command status enum

typedef NS_ENUM(NSUInteger,ApiMedicCommandStatus)
{
    acsCreated,
    acsAuthorized,
    acsSent,
    acsProcessing,
    acsCompleted,
    acsParseError,
    acsError
};

@class DiagnosisClient;

//
// All calls to the server are asynchronous and use completion blocks to return data
// back to the caller. Be sure to check the command status before using the data returned,
// the completion block will also be called if there is an error along the way.
//
typedef void(^ApiMedicLoadFromWebCompletion)(DiagnosisClient*, ApiMedicCommandStatus, NSDictionary*);

typedef void(^ApiMedicHealthItemLoadCompletion)(DiagnosisClient*, ApiMedicCommandStatus, NSMutableArray<HealthItem*>*);
typedef void(^ApiMedicHealthSymptomSelectorLoadCompletion)(DiagnosisClient*, ApiMedicCommandStatus, NSMutableArray<HealthSymptomSelector*>*);
typedef void(^ApiMedicHealthDiagnosisLoadCompletion)(DiagnosisClient*, ApiMedicCommandStatus, NSMutableArray<HealthDiagnosis*>*);
typedef void(^ApiMedicHealthSpecialisationsLoadCompletion)(DiagnosisClient*, ApiMedicCommandStatus, NSMutableArray<DiagnosedSpecialisation*>*);
typedef void(^ApiMedicHealthIssueInfoLoadCompletion)(DiagnosisClient*, ApiMedicCommandStatus, HealthIssueInfo*);
typedef void(^ApiMedicAuthorizeAccessTokenCompletion)(DiagnosisClient*, ApiMedicCommandStatus, AccessToken*);
typedef void(^ApiMedicRedFlagLoadCompletion)(DiagnosisClient*, ApiMedicCommandStatus, NSString*);

// Delegate protocol for API completion
@protocol ApiMedicDiagnosisClientDelegate <NSObject>
@required
- (void) apiCallCompleted:(DiagnosisClient*)client;
@end


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///
/// Client interface object for the health service API
///

@interface DiagnosisClient : NSObject
{
    id <ApiMedicDiagnosisClientDelegate> _delegate;
}

// Use this to get the status of the last client request
@property (nonatomic) NSInteger commandStatus;

// Use this to set an optional client delegate to notify when
// an api call completes
@property (nonatomic,strong) id delegate;

/// <summary>
/// DiagnosisClient constructor
/// </summary>
/// <param name="username">api user username</param>
/// <param name="password">api user password</param>
/// <param name="authServiceUrl">priaid login url (https://authservice.priaid.ch/login)</param>
/// <param name="language">language</param>
/// <param name="healthServiceUrl">priaid healthservice url(https://healthservice.priaid.ch)</param>
- (id)init:(NSString*)username password:(NSString*)password authServiceUrl:(NSString*)authServiceUrl language:(NSString*)language healthServiceUrl:(NSString*)healthServiceUrl;

// <summary>
/// Authorize against the service and get access token. Must be called before calling any other LoadXXXX methods.
/// </summary>
- (void)authorizeAccessToken:(ApiMedicAuthorizeAccessTokenCompletion)completion;

// <summary>
/// Load all symptoms
/// </summary>
/// <returns>Returns list of all symptoms</returns>
- (void) LoadSymptoms:(ApiMedicHealthItemLoadCompletion)completion;

/// <summary>
/// Load all issues
/// </summary>
/// <returns>Returns list of all issues</returns>
- (void) LoadIssues:(ApiMedicHealthItemLoadCompletion)completion;

/// <summary>
/// Load detail informations about selected issue
/// </summary>
/// <param name="issueId"></param>
/// <returns>Returns detail informations about selected issue</returns>
- (void) LoadIssueInfo:(ApiMedicHealthIssueInfoLoadCompletion) completion issueId:(int) issueId;

/// <summary>
/// Load calculated list of potential issues for selected parameters
/// </summary>
/// <param name="selectedSymptoms">List of selected symptom ids</param>
/// <param name="gender">Selected person gender (Male, Female)</param>
/// <param name="yearOfBirth">Selected person year of born</param>
/// <returns>Returns calculated list of potential issues for selected parameters</returns>
- (void)LoadDiagnosis:(ApiMedicHealthDiagnosisLoadCompletion)completion selectedSymptoms:(NSMutableArray<NSNumber*>*)selectedSymptoms gender:(int)gender yearOfBirth:(int)yearOfBirth;

/// <summary>
/// Load calculated list of specialisations for selected parameters
/// </summary>
/// <param name="selectedSymptoms">List of selected symptom ids</param>
/// <param name="gender">Selected person gender (Male, Female)</param>
/// <param name="yearOfBirth">Selected person year of born</param>
/// <returns>Returns calculated list of specialisations for selected parameters</returns>
- (void) LoadSpecialisations:(ApiMedicHealthSpecialisationsLoadCompletion)completion selectedSymptoms:(NSMutableArray<NSNumber*>*) selectedSymptoms gender:(int)gender yearOfBirth:(int)yearOfBirth;

/// <summary>
/// Load human body locations
/// </summary>
/// <returns>Returns list of human body locations</returns>
- (void) LoadBodyLocations:(ApiMedicHealthItemLoadCompletion)completion;

/// <summary>
/// Load human body sublocations for selected human body location
/// </summary>
/// <param name="bodyLocationId">Human body location id</param>
/// <returns>Returns list of human body sublocations for selected human body location</returns>
- (void) LoadBodySubLocations:(ApiMedicHealthItemLoadCompletion) completion bodyLocationId:(int) bodyLocationId;

/// <summary>
/// Load all symptoms for selected human body location
/// </summary>
/// <param name="locationId">Human body sublocation id</param>
/// <param name="selectedSelectorStatus">Selector status (Man, Woman, Boy, Girl)</param>
/// <returns>Returns list of all symptoms for selected human body location</returns>
- (void) LoadSubLocationSymptoms:(ApiMedicHealthSymptomSelectorLoadCompletion) completion locationId:(int) locationId selectedSelectorStatus:(int)selectedSelectorStatus;

/// <summary>
/// Load list of proposed symptoms for selected symptoms combination
/// </summary>
/// <param name="selectedSymptoms">List of selected symptom ids</param>
/// <param name="gender">Selected person gender (Male, Female)</param>
/// <param name="yearOfBirth">Selected person year of born</param>
/// <returns>Returns list of proposed symptoms for selected symptoms combination</returns>
- (void) LoadProposedSymptoms:(ApiMedicHealthItemLoadCompletion) completion selectedSymptoms:(NSMutableArray<NSNumber*>*) selectedSymptoms gender:(int)gender yearOfBirth:(int)yearOfBirth;

/// <summary>
/// Load red flag text for selected symptom
/// </summary>
/// <param name="symptomId">Selected symptom id</param>
/// <returns>Returns red flag text for selected symptom</returns>
- (void) LoadRedFlag:(ApiMedicRedFlagLoadCompletion) completion symptomId:(int)symptomId;


@end
