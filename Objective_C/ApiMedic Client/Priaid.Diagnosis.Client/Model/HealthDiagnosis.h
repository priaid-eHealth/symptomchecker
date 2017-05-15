//
//  HealthDiagnosis.h
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
#import "HealthItem.h"
#import "../JSON Encoder/KVCBaseObject.h"


/////////////////////////////////////////////////////////////////////////////////

@interface DiagnosedIssue : HealthItem

/// ICD code
@property (strong, nonatomic) NSString *Icd;
/// ICD name
@property (strong, nonatomic) NSString *IcdName;
/// Profesional name
@property (strong, nonatomic) NSString *ProfName;
/// Probability for the issue in %
@property (nonatomic) NSNumber *Accuracy;

- (void)setValuesFromJSON:(NSDictionary*)JSON;

@end

/////////////////////////////////////////////////////////////////////////////////


@interface MatchedSpecialisation : HealthItem

/// ID of specialisation
@property (nonatomic) NSInteger *SpecialistID;

- (void)setValuesFromJSON:(NSDictionary*)JSON;

@end

/////////////////////////////////////////////////////////////////////////////////

@interface DiagnosedSpecialisation : HealthItem

/// Probability for the issue in %
@property (nonatomic) NSNumber *Accuracy;

- (void)setValuesFromJSON:(NSDictionary*)JSON;

@end

/////////////////////////////////////////////////////////////////////////////////


@interface HealthDiagnosis : KVCBaseObject

/// Diagnosed issue
@property (strong, nonatomic) DiagnosedIssue *Issue;
/// List of suggested doctor specialisations for this issue
@property (strong, nonatomic) NSMutableArray<MatchedSpecialisation*> *Specialisation;

- (void)setValuesFromJSON:(NSDictionary*)JSON;

@end



