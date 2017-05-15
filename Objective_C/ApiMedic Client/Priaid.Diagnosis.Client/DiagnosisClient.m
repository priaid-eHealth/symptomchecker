//
//  DiagnosisClient.m
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

#import <objc/runtime.h>
#include <CommonCrypto/CommonDigest.h>
#include <CommonCrypto/CommonHMAC.h>
#include <sys/types.h>
#include <errno.h>
#include <fcntl.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <unistd.h>
#import "DiagnosisClient.h"
#import "Model/AccessToken.h"
#import "JSON Extensions/NSObject+setValuesForKeysWithJSONDictionary.h"


/////////////////////////////////////////////// NSString category to make some things easier

@interface NSString (ApiMedicStringAdditions)

- (BOOL)containsString:(NSString *)string;
- (BOOL)containsString:(NSString *)string
               options:(NSStringCompareOptions)options;

@end

@implementation NSString (ApiMedicStringAdditions)

- (BOOL)containsString:(NSString *)string
               options:(NSStringCompareOptions)options {
    NSRange rng = [self rangeOfString:string options:options];
    return rng.location != NSNotFound;
}

- (BOOL)containsString:(NSString *)string {
    return [self containsString:string options:0];
}


@end

/////////////////////////////////////////////// DiagnosisClient private properties

@interface DiagnosisClient ()

@property (strong, nonatomic) AccessToken *_token;
@property (strong, nonatomic) NSString *_language;
@property (strong, nonatomic) NSString *_username;
@property (strong, nonatomic) NSString *_password;
@property (strong, nonatomic) NSString *_healthServiceUrl;
@property (strong, nonatomic) NSString *_authServiceUrl;

@end

/////////////////////////////////////////////// DiagnosisClient class implementation

@implementation DiagnosisClient

///////////////////////////////////////// Class methods

+ (NSString*)GenderToString:(int)gender
{
    switch (gender)
    {
        case Male: return @"Male";
        case Female: return @"Female";
    }
    return @"";
}

+ (NSString*)SelectorStatusToString:(int)selectorStatus
{
    switch (selectorStatus)
    {
        case Man: return @"Man";
        case Woman: return @"Woman";
        case Boy: return @"Boy";
        case Girl: return @"Girl";
    }
    return @"";
}


+ (NSData *)doHmacMD5:(NSData *)dataIn
                  key:(NSData *)key
{
    NSMutableData *macOut = [NSMutableData dataWithLength:CC_MD5_DIGEST_LENGTH];
    
    CCHmac( kCCHmacAlgMD5,
           key.bytes,
           key.length,
           dataIn.bytes,
           dataIn.length,
           macOut.mutableBytes);
    
    return macOut;
}

+ (NSString*) symptomsToJSON:(NSMutableArray<NSNumber*>*) symptoms
{
    NSMutableString* s=[[NSMutableString alloc] init];
    [s appendString:@"["];
    
    if (symptoms!=nil && [symptoms count]>0)
    {
        for (int i=0;i<[symptoms count];i++)
        {
            if (i>0) [s appendString:@","];
            [s appendFormat:@"%@", [((NSNumber*)[symptoms objectAtIndex:i]) stringValue]];
        }
    }
    
    [s appendString:@"]"];
    return s;
}

///////////////////////////////////////// Instance methods

- (id)init:(NSString*)username password:(NSString*)password authServiceUrl:(NSString*)authServiceUrl language:(NSString*)language healthServiceUrl:(NSString*)healthServiceUrl
{
    self = [super init];
    if (self) {
        self._token=nil;
        self._language=language;
        self._username=username;
        self._password=password;
        self._healthServiceUrl=healthServiceUrl;
        self._authServiceUrl=authServiceUrl;
    }
    return self;
}

- (void)authorizeAccessToken:(ApiMedicAuthorizeAccessTokenCompletion)completion
{
    [self LoadToken:^(DiagnosisClient * client, ApiMedicCommandStatus commandStatus, AccessToken * accessToken) {
        if (commandStatus==acsAuthorized)
        {
            self._token=accessToken;
            self.commandStatus=acsAuthorized;
        }
        if (completion)  completion(client,commandStatus,accessToken);
    } username:self._username password:self._password url:self._authServiceUrl];
}

- (void)LoadToken:(ApiMedicAuthorizeAccessTokenCompletion)completion username:(NSString*)username password:(NSString*)password url:(NSString*)url
{
    NSData *hmacData = [DiagnosisClient doHmacMD5:[url dataUsingEncoding:NSUTF8StringEncoding] key:[password dataUsingEncoding:NSUTF8StringEncoding]];
    NSString *computedHashString = [hmacData base64EncodedStringWithOptions:0];
    
    //Response data object
    NSData *returnData = [[NSData alloc]init];
    
    //Build the Request
    NSMutableURLRequest *request = [[NSMutableURLRequest alloc] initWithURL:[NSURL URLWithString:url]];
    [request setHTTPMethod:@"POST"];
    
    NSString* authValue=[NSString stringWithFormat:@"Bearer %@:%@",username,computedHashString];
    
    [request setValue:authValue forHTTPHeaderField:@"Authorization"];
    //    [request setValue:[NSString stringWithFormat:@"%lu", (unsigned long)[postString length]] forHTTPHeaderField:@"Content-length"];
    [request setHTTPBody:[@"" dataUsingEncoding:NSUTF8StringEncoding]];
    
    //Send the Request
    returnData = [NSURLConnection sendSynchronousRequest: request returningResponse: nil error: nil];
    
    NSError *parseError = nil;

    NSDictionary* JSON = [NSJSONSerialization JSONObjectWithData:returnData options:kNilOptions error:&parseError];
    
    if (parseError)
    {
        NSString *returnString=[[NSString alloc] initWithData:returnData encoding:NSUTF8StringEncoding];
        NSLog(@"Error [%@] occurred during JSON parsing of [%@]", [parseError localizedDescription], returnString);
        if (completion) completion(self,acsParseError,nil);
    }
    else
    {
        AccessToken* accessToken=[[AccessToken alloc] init];
        [accessToken setValuesFromJSON:JSON];
        NSLog(@"Object data loaded [%@]",accessToken);
        if (completion) completion(self,acsAuthorized,accessToken);
    }
  
}

-(void)processData:(NSData*)data completion:(ApiMedicLoadFromWebCompletion)completion;
{
    ApiMedicCommandStatus ac=acsProcessing;
    NSLog(@"Processing, data is [%@]", [[NSString alloc] initWithData:data encoding:NSUTF8StringEncoding]);
    NSError *parseError = nil;
    NSDictionary* JSON = [NSJSONSerialization JSONObjectWithData:data options:kNilOptions error:&parseError];
    if (parseError)
    {
        NSLog(@"Error [%@] occurred during JSON parsing of [%@]", [parseError localizedDescription], [[NSString alloc] initWithData:data encoding:NSUTF8StringEncoding]);
        ac=acsParseError;
    }
    else
    {
     //   [self setValuesFromJSON:JSON];
        ac=acsCompleted;
        NSLog(@"Object data loaded [%@]",self);
    }
    if (_delegate) [_delegate apiCallCompleted:self];
    if (completion) completion(self,ac,JSON);
    NSLog(@"ProcessData completed");
}

- (void)LoadFromWebService:(ApiMedicLoadFromWebCompletion)completion action:(NSString*)action
{
    NSString* extraArgs = [NSString stringWithFormat:@"token=%@&format=json&language=%@", self._token.Token, self._language];
    
    NSString* url = [NSString stringWithFormat:@"%@/%@%@%@", self._healthServiceUrl, action, ([action containsString:@"?"] ? @"&" : @"?"), extraArgs ];
    
    @try {
        NSMutableURLRequest *request = nil;
    
        NSLog(@"Using GET for the request");
        
        NSURL* requestURL = [NSURL URLWithString:url];
        request = [NSMutableURLRequest requestWithURL: requestURL];
        
        NSLog(@"Sending request [%@]", url);
#ifdef DEBUG
        NSDate *methodStart = [NSDate date];
#endif
    
        [NSURLConnection sendAsynchronousRequest:request queue:[NSOperationQueue mainQueue] completionHandler: ^(NSURLResponse *response, NSData *data, NSError *error)
        {
#ifdef DEBUG
            NSDate *methodFinish = [NSDate date];
            NSTimeInterval executionTime = [methodFinish timeIntervalSinceDate:methodStart];
#endif
            if (!error)
            {
                NSString* stringData=[[NSString alloc] initWithData:data encoding:NSUTF8StringEncoding];
                NSLog(@"Received request data in %f seconds for request [%@] data is [%@]", executionTime, url, stringData);
                
                NSError *parseError = nil;
                NSDictionary* JSON = [NSJSONSerialization JSONObjectWithData:data options:NSJSONReadingAllowFragments error:&parseError];
                if (parseError)
                {
                    NSString *returnString=[[NSString alloc] initWithData:data encoding:NSUTF8StringEncoding];
                    NSLog(@"Error [%@] occurred during JSON parsing of [%@]", [parseError localizedDescription], returnString);
                    if (completion) completion(self,acsParseError,nil);
                }
                else
                {
                    if (completion) completion(self,acsCompleted,JSON);
                }


            }
            else
            {
                NSLog(@"Error [%@] occurred after %f seconds for request [%@]", [error localizedDescription], executionTime, url);
                if (completion) completion(self,acsError,nil);
            }
        }];
    }
    @catch (NSException* ex)
    {
        if (completion) completion(self,acsError,nil);
    }
}

- (void) GenericHealthItemLoader:(ApiMedicHealthItemLoadCompletion)completion action:(NSString*)action
{
    [self LoadFromWebService:^(DiagnosisClient * client, ApiMedicCommandStatus commandStatus, NSDictionary * JSON) {
        if (completion)
        {
            NSMutableArray<HealthItem*>* items=[[NSMutableArray<HealthItem*> alloc] init];
            
            if ([JSON isKindOfClass:[NSArray class]])
            {
                NSArray* ar=(NSArray*)JSON;
                NSInteger entrycount=[ar count];
                for (NSUInteger i=0;i<entrycount;i++)
                {
                    NSDictionary* itemjson=[ar objectAtIndex:i];
                    HealthItem* item=[[HealthItem alloc] init];
                    [item setValuesFromJSON:itemjson];
                    [items addObject:item];
                }
            }
            
            // dispatch to main queue to be helpful for applications
            // that update the UI in the completion handler
            dispatch_async( dispatch_get_main_queue(), ^{
                completion(client,commandStatus,items);
                
            });
        }
    } action:action];
}

- (void) LoadSymptoms:(ApiMedicHealthItemLoadCompletion)completion
{
    [self GenericHealthItemLoader:completion action:@"symptoms"];
}


- (void) LoadIssues:(ApiMedicHealthItemLoadCompletion)completion
{
    [self GenericHealthItemLoader:completion action:@"issues"];
}


- (void) LoadIssueInfo:(ApiMedicHealthIssueInfoLoadCompletion) completion issueId:(int) issueId
{
    NSString* action = [NSString stringWithFormat:@"issues/%i/info", issueId];

    [self LoadFromWebService:^(DiagnosisClient * client, ApiMedicCommandStatus commandStatus, NSDictionary * JSON) {
        if (completion)
        {
            HealthIssueInfo* info=[[HealthIssueInfo alloc] init];
            [info setValuesFromJSON:JSON];
            
            // dispatch to main queue to be helpful for applications
            // that update the UI in the completion handler
            dispatch_async( dispatch_get_main_queue(), ^{
                completion(client,commandStatus,info);
                
            });
        }
    } action:action];
}


- (void)LoadDiagnosis:(ApiMedicHealthDiagnosisLoadCompletion)completion selectedSymptoms:(NSMutableArray<NSNumber*>*)selectedSymptoms gender:(int)gender yearOfBirth:(int)yearOfBirth
{
    if (selectedSymptoms == nil || [selectedSymptoms count]==0)
    {
        [NSException raise:@"Argument cannot be nil or empty" format:@"LoadDiagnosis: selectedSymptoms cannot be nil or empty"];
    }
    
    NSString* serializedSymptoms = [DiagnosisClient symptomsToJSON:selectedSymptoms];
    
    NSString* action = [NSString stringWithFormat:@"diagnosis?symptoms=%@&gender=%@&year_of_birth=%i", serializedSymptoms, [DiagnosisClient GenderToString:gender], yearOfBirth];
    
    [self LoadFromWebService:^(DiagnosisClient * client, ApiMedicCommandStatus commandStatus, NSDictionary * JSON) {
        if (completion)
        {
            NSMutableArray<HealthDiagnosis*>* items=[[NSMutableArray<HealthDiagnosis*> alloc] init];
            
            if ([JSON isKindOfClass:[NSArray class]])
            {
                NSArray* ar=(NSArray*)JSON;
                NSInteger entrycount=[ar count];
                for (NSUInteger i=0;i<entrycount;i++)
                {
                    NSDictionary* itemjson=[ar objectAtIndex:i];
                    HealthDiagnosis* item=[[HealthDiagnosis alloc] init];
                    [item setValuesFromJSON:itemjson];
                    [items addObject:item];
                }
            }
            
            // dispatch to main queue to be helpful for applications
            // that update the UI in the completion handler
            dispatch_async( dispatch_get_main_queue(), ^{
                completion(client,commandStatus,items);
                
            });
        }
    } action:action];
}


- (void) LoadSpecialisations:(ApiMedicHealthSpecialisationsLoadCompletion)completion selectedSymptoms:(NSMutableArray<NSNumber*>*) selectedSymptoms gender:(int)gender yearOfBirth:(int)yearOfBirth
{
    if (selectedSymptoms == nil || [selectedSymptoms count]==0)
    {
        [NSException raise:@"Argument cannot be nil or empty" format:@"LoadSpecializations: selectedSymptoms cannot be nil or empty"];
    }
    
    NSString* serializedSymptoms = [DiagnosisClient symptomsToJSON:selectedSymptoms];
    
    NSString* action = [NSString stringWithFormat:@"diagnosis/specialisations?symptoms=%@&gender=%@&year_of_birth=%i", serializedSymptoms, [DiagnosisClient GenderToString:gender], yearOfBirth];
    
    [self LoadFromWebService:^(DiagnosisClient * client, ApiMedicCommandStatus commandStatus, NSDictionary * JSON) {
        if (completion)
        {
            NSMutableArray<DiagnosedSpecialisation*>* items=[[NSMutableArray<DiagnosedSpecialisation*> alloc] init];
            
            if ([JSON isKindOfClass:[NSArray class]])
            {
                NSArray* ar=(NSArray*)JSON;
                NSInteger entrycount=[ar count];
                for (NSUInteger i=0;i<entrycount;i++)
                {
                    NSDictionary* itemjson=[ar objectAtIndex:i];
                    DiagnosedSpecialisation* item=[[DiagnosedSpecialisation alloc] init];
                    [item setValuesFromJSON:itemjson];
                    [items addObject:item];
                }
            }
            
            // dispatch to main queue to be helpful for applications
            // that update the UI in the completion handler
            dispatch_async( dispatch_get_main_queue(), ^{
                completion(client,commandStatus,items);
                
            });
        }
    } action:action];
}

- (void) LoadBodyLocations:(ApiMedicHealthItemLoadCompletion)completion
{
    [self GenericHealthItemLoader:completion action:@"body/locations"];
}


- (void) LoadBodySubLocations:(ApiMedicHealthItemLoadCompletion) completion bodyLocationId:(int) bodyLocationId
{
    NSString* action = [NSString stringWithFormat:@"body/locations/%i", bodyLocationId];
    
    [self GenericHealthItemLoader:completion action:action];
}


- (void) LoadSubLocationSymptoms:(ApiMedicHealthSymptomSelectorLoadCompletion) completion locationId:(int) locationId selectedSelectorStatus:(int)selectedSelectorStatus
{
    NSString* action = [NSString stringWithFormat:@"symptoms/%i/%@", locationId, [DiagnosisClient SelectorStatusToString:selectedSelectorStatus]];
    
    [self LoadFromWebService:^(DiagnosisClient * client, ApiMedicCommandStatus commandStatus, NSDictionary * JSON) {
        if (completion)
        {
            NSMutableArray<HealthSymptomSelector*>* items=[[NSMutableArray<HealthSymptomSelector*> alloc] init];
            
            if ([JSON isKindOfClass:[NSArray class]])
            {
                NSArray* ar=(NSArray*)JSON;
                NSInteger entrycount=[ar count];
                for (NSUInteger i=0;i<entrycount;i++)
                {
                    NSDictionary* itemjson=[ar objectAtIndex:i];
                    HealthSymptomSelector* item=[[HealthSymptomSelector alloc] init];
                    [item setValuesFromJSON:itemjson];
                    [items addObject:item];
                }
            }
            
            // dispatch to main queue to be helpful for applications
            // that update the UI in the completion handler
            dispatch_async( dispatch_get_main_queue(), ^{
                completion(client,commandStatus,items);
                
            });
        }
    } action:action];
    
}


- (void) LoadProposedSymptoms:(ApiMedicHealthItemLoadCompletion) completion selectedSymptoms:(NSMutableArray<NSNumber*>*) selectedSymptoms gender:(int)gender yearOfBirth:(int)yearOfBirth
{
    if (selectedSymptoms == nil || [selectedSymptoms count]==0)
    {
        [NSException raise:@"Argument cannot be nil or empty" format:@"LoadProposedSymptoms: selectedSymptoms cannot be nil or empty"];
    }
    
    NSString* serializedSymptoms = [DiagnosisClient symptomsToJSON:selectedSymptoms];
    
    NSString* action = [NSString stringWithFormat:@"symptoms/proposed?symptoms=%@&gender=%@&year_of_birth=%i", serializedSymptoms, [DiagnosisClient GenderToString:gender], yearOfBirth];
    
    [self GenericHealthItemLoader:completion action:action];
}


- (void) LoadRedFlag:(ApiMedicRedFlagLoadCompletion) completion symptomId:(int)symptomId
{
    NSString* action = [NSString stringWithFormat:@"redflag?symptomId=%i",symptomId];
    
    [self LoadFromWebService:^(DiagnosisClient * client, ApiMedicCommandStatus commandStatus, NSDictionary * JSON) {
        if (completion)
        {
            NSString* redflag=@"";
            
            if ([JSON isKindOfClass:[NSString class]])
            {
                redflag = (NSString*)JSON;
            }
            
            // dispatch to main queue to be helpful for applications
            // that update the UI in the completion handler
            dispatch_async( dispatch_get_main_queue(), ^{
                completion(client,commandStatus,redflag);
                
            });
        }
    } action:action];
}



@end
