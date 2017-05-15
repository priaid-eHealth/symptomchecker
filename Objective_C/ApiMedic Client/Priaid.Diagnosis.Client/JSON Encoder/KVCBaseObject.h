#import <Foundation/Foundation.h>
#import "objc/runtime.h"

@interface KVCBaseObject : NSObject
{
    
}

- (NSString *) getComponentTypeForCollection:(NSString *)propertyName;
+ (NSMutableDictionary *) getPropertiesAndTypesForClassName:(NSString*)className;

/*
 * In case you need to use a different property name for a json key, choose
 * from one of the two methods appropriately.
 */
- (NSString *) getPropertyNameForJsonKey:(NSString *)jsonKey;
- (NSString *) getJsonKeyForPropertyName:(NSString *)propertyName;

/*
 * Use the below two methods for deserializing to Objects
 */
+ (KVCBaseObject *)objectForJSON:(NSString *) inputJSON;
+ (KVCBaseObject *)objectForDictionary:(NSDictionary *) inputDict;

/*
 * Use the below two methods for serializing To JSON or NSDictionary
 */

- (NSDictionary *)objectToDictionary:(NSString*)ignoreFields;
- (NSString *)objectToJson;
- (NSString *)objectToJson:(NSString*)ignoreFields;

@end
