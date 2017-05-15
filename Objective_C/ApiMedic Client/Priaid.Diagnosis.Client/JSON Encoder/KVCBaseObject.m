#import "KVCBaseObject.h"
#import "JSON.h"


@implementation KVCBaseObject

const char * property_getTypeString( objc_property_t property );

- (id) init {
    if (self = [super init]) {
        
    }
    return self;
}

- (NSString *) getJsonKeyForPropertyName:(NSString *)propertyName {
    
    return nil;
}

/*
 * Should be implemented by subclasses using NSArray types.
 */
- (NSString *)getComponentTypeForCollection:(NSString *)propertyName {
    return nil;
}

/*
 * Should be implemented by subclasses that will have a different propertyName for a json key.
 */
- (NSString *) getPropertyNameForJsonKey:(NSString *)jsonKey {
    return nil;
}

+ (id)objectForJSON:(NSString *) inputJSON {
    SBJSON *parser = [[SBJSON alloc] init];
	NSDictionary *jDict = [parser objectWithString:inputJSON error:nil];
    return [self objectForDictionary:jDict];
}


const char * property_getTypeString( objc_property_t property )
{
    const char * attrs = property_getAttributes( property );
    if ( attrs == NULL )
        return ( NULL );
    
    static char buffer[256];
    const char * e = strchr( attrs, ',' );
    if ( e == NULL )
        return ( NULL );
    
    int len = (int)(e - attrs);
    memcpy( buffer, attrs, len );
    buffer[len] = '\0';
    
    return ( buffer );
}

+ (BOOL) hasPropertyNamed: (NSString *) name
{
    return ( class_getProperty(self, [name UTF8String]) != NULL );
}


+ (BOOL) hasPropertyForKVCKey: (NSString *) key
{
    if ( [self hasPropertyNamed: key] )
        return ( YES );
    
    return NO;
}

+ (char *) typeOfPropertyNamed: (const char *) rawPropType
{
    int k = 0;
#define PP_LEN 128
    char * parsedPropertyType = malloc(sizeof(char) * PP_LEN);
    if (*rawPropType == 'T') {
        rawPropType++;
    } else { 
        rawPropType = NULL;
    }
    
    if (rawPropType == NULL) {
        free(parsedPropertyType);
        return NULL;
    }
    if (*rawPropType == '@') {
        rawPropType+=2;
        for (; (*rawPropType != '\"') && (k<PP_LEN);) {
            parsedPropertyType[k++] = *rawPropType;
            rawPropType++;
            if (k>=PP_LEN)
            {
                NSLog(@"typeOfPropertyNamed: memory overrun");
                break;
            }
        }
        parsedPropertyType[k] = '\0';
        return parsedPropertyType;
        
    } else if (*rawPropType == 'i'){
        parsedPropertyType = strcpy(parsedPropertyType,"NSInteger\0");
        return parsedPropertyType;
    } else if (*rawPropType == 'd'){
        parsedPropertyType = strcpy(parsedPropertyType,"double\0");
        return parsedPropertyType;
    } else if (*rawPropType == 'f') {
        parsedPropertyType = strcpy(parsedPropertyType,"float\0");
        return parsedPropertyType;
    } else if (*rawPropType == 'c') {
        parsedPropertyType = strcpy(parsedPropertyType,"BOOL\0");
        return parsedPropertyType;
    }
    free(parsedPropertyType);
    return ( NULL );
}




+ (NSMutableDictionary *) getPropertiesAndTypesForClassName:(NSString*)className {
    NSMutableDictionary * dict = [[NSMutableDictionary alloc] init];
    id class = NSClassFromString(className);
    if ([class superclass] != [NSObject class]) {
        dict = [KVCBaseObject getPropertiesAndTypesForClassName:NSStringFromClass([class superclass])];
    }
    unsigned int outCount, i; objc_property_t *properties = class_copyPropertyList(class, &outCount); 
    for (i = 0; i < outCount; i++) {
        objc_property_t property = properties[i];
        const char * propName = property_getName(property);
        NSString * propertyName = [NSString stringWithCString:propName encoding:NSUTF8StringEncoding];
        const char * rawPropType = property_getTypeString(property);
        const char * objCType = [self typeOfPropertyNamed:rawPropType];
        if (objCType == NULL) {
            NSLog(@"Invalid property type for propertyName %@. Skip ", propertyName);
        } else {
            NSLog(@"Processing property type for propertyName %@.", propertyName);
            NSString * propertyType = [NSString stringWithCString:objCType encoding:NSUTF8StringEncoding];
            
            
            [dict setValue:propertyType forKey:propertyName];
        }
        if (objCType != NULL)
            free((char *)objCType);
        
    }
    free(properties);
    return dict;
}

+(BOOL) isPropertyTypeDictionary:(NSString *)propertyType {
    if ([propertyType isEqualToString:@"NSDictionary"] ||
        [propertyType isEqualToString:@"NSMutableDictionary"]) {
        return YES;
    } else {
        return NO;
    }
}

+(BOOL) isPropertyTypeArray:(NSString *)propertyType {
    if ([propertyType isEqualToString:@"NSArray"] ||
        [propertyType isEqualToString:@"NSMutableArray"]) {
        return YES;
    } else {
        return NO;
    }
}

+(BOOL) isPropertyTypeBasic:(NSString *)propertyType {
    if ([propertyType isEqualToString:@"NSString"] ||
        [propertyType isEqualToString:@"NSNumber"] ||
        [propertyType isEqualToString:@"NSInteger"] ||
        [propertyType isEqualToString:@"float"] || 
        [propertyType isEqualToString:@"double"] ||
        [propertyType isEqualToString:@"BOOL"]) {
        
        return YES;
    } else {
        return NO;
    }
}

+(id) objectForPropertyKey:(NSString *)propertyType {
    id kvcObject = [[NSClassFromString(propertyType) alloc] init];
    return kvcObject;
}

+ (NSArray *)arrayForType:(NSString *)componentType withJSONArray:(NSArray *)jArray {
    if ([componentType isEqualToString:@"NSString"] ||
        [componentType isEqualToString:@"NSNumber"]) {
        return [NSArray arrayWithArray:jArray];
    }
    
    /*
     * Now for some good object mapping
     * with classic recursion!
     */
    
    NSMutableArray * resultArray = [[NSMutableArray alloc] init];
    
    for (NSDictionary * item in jArray) {
        Class childClass = NSClassFromString(componentType);
        id kvcChild = [childClass objectForDictionary:item];
        [resultArray addObject:kvcChild];
    }
    
    return resultArray;
}

+ (id)objectForDictionary:(NSDictionary *) inputDict {
    if ([inputDict isKindOfClass:[NSNull class]]) {
        return nil;
    }
    
    NSString* className = NSStringFromClass([self class]);
    NSDictionary * propertyDict = [self getPropertiesAndTypesForClassName:className];
    NSArray * propertyKeys = [propertyDict allKeys];
    
    //Create our object
    id kvcObject = [[NSClassFromString(className) alloc] init];
    
    for (NSString* k in [inputDict allKeys]) {
        NSString* key=[NSString stringWithString:k];
        id propertyValue = [inputDict objectForKey:key];
        
        
        if (![propertyKeys containsObject:key]) {
            key = [kvcObject getPropertyNameForJsonKey:key];
        }
        if (key) {
            NSString * propType = [propertyDict objectForKey:key];
            /*
             * Sometimes an invalid property type can be used by the client object.
             * Gracefully ignore it.
             */
            if (propType == nil) {
                continue;
            }
            
            if ([KVCBaseObject isPropertyTypeArray:propType]) {
                
                NSString * componentType = [kvcObject getComponentTypeForCollection:key];
                NSArray  * jArray = (NSArray *)propertyValue;
                // If the object has specified a type, create objects of that type. else 
                // set the array as such.
                if ([componentType length] > 1) {
                    NSArray * componentArray = [KVCBaseObject arrayForType:componentType withJSONArray:jArray];
                    [kvcObject setValue:componentArray forKey:key];
                } else {
                    [kvcObject setValue:jArray forKey:key];
                }
                
            } else if ([KVCBaseObject isPropertyTypeBasic:propType]) {
                
                [kvcObject setValue:propertyValue forKey:key];
                
            } else {
                /*
                 * If the component is not any primitive type or array
                 * create a custom object of it and pass the dictionary to it.
                 */
                Class childClass = NSClassFromString(propType);
                if ([childClass isSubclassOfClass:[KVCBaseObject class]]) {
                    id kvcChild = [childClass objectForDictionary:propertyValue];
                    [kvcObject setValue:kvcChild forKey:key];
                } else {
                    [kvcObject setValue:propertyValue forKey:key];
                }
            }
        }
        
    }
    return kvcObject;
}

- (NSString *)customKeyForPropertyName:(NSString *)propertyName {
    NSString * customJsonKey = [self getJsonKeyForPropertyName:propertyName];
    if (customJsonKey == nil) {
        return propertyName;
    } else {
        return customJsonKey;
    }
}

- (NSDictionary *)objectToDictionary:(NSString*)ignoreFields {
    NSString* className = NSStringFromClass([self class]);
    NSDictionary * propertyDict = [KVCBaseObject getPropertiesAndTypesForClassName:className];
    
    NSMutableDictionary * resultDict = [[NSMutableDictionary alloc] init];
    for (NSString * currentProperty in propertyDict) {
        
        if ([ignoreFields containsString:currentProperty])
        {
            NSLog(@"Ignoring property %@",currentProperty);
            continue; //ignore this property
        }
        
        NSString * propType = [propertyDict objectForKey:currentProperty];
        
        /*
         
         * Gracefully ignore it.
         */
        if (propType == nil) {
            continue;
        }
        
        
        if ([KVCBaseObject isPropertyTypeArray:propType]) {
            
            NSArray * objArray = [self valueForKey:currentProperty];
            if ([objArray count] > 0) {
                id firstObject = [objArray objectAtIndex:0];
                if ([firstObject isKindOfClass:[NSString class]] ||
                    [firstObject isKindOfClass:[NSNumber class]]) {
                    
                    [resultDict setValue:objArray forKey:[self customKeyForPropertyName:currentProperty]];
                    
                } else {
                    
                    NSMutableArray * customObjArray = [[NSMutableArray alloc] init];
                    for (id arrayObj in objArray) {
                        if ([arrayObj isKindOfClass:[KVCBaseObject class]]){
                            NSDictionary * childDict = [arrayObj objectToDictionary:ignoreFields];
                            [customObjArray addObject:childDict];
                        }
                    }
                    [resultDict setValue:customObjArray forKey:[self customKeyForPropertyName:currentProperty]];
                    
                }
            } else {
                NSArray * emptyArray = [[NSArray alloc] init];
                [resultDict setValue:emptyArray forKey:[self customKeyForPropertyName:currentProperty]];
  
            }
            
            
        } else if ([KVCBaseObject isPropertyTypeDictionary:propType]) {
            NSDictionary * objDict = [self valueForKey:currentProperty];
            NSArray *keys = [objDict allKeys];
            if ([keys count] > 0) {
                id firstObject = [objDict objectForKey:[keys objectAtIndex:0]];
                if ([firstObject isKindOfClass:[NSString class]] ||
                    [firstObject isKindOfClass:[NSNumber class]]) {
                    
                    [resultDict setValue:objDict forKey:[self customKeyForPropertyName:currentProperty]];
                    
                } else {
                    
                    NSMutableArray * customObjArray = [[NSMutableArray alloc] init];
                    for (id key in keys) {
                        id dictObj=[objDict objectForKey:key];
                        if ([dictObj isKindOfClass:[KVCBaseObject class]]){
                            NSDictionary * childDict = [dictObj objectToDictionary:ignoreFields];
                            [customObjArray addObject:childDict];
                        }
                    }
                    [resultDict setValue:customObjArray forKey:[self customKeyForPropertyName:currentProperty]];
                    
                }
            } else {
                NSArray * emptyArray = [[NSArray alloc] init];
                [resultDict setValue:emptyArray forKey:[self customKeyForPropertyName:currentProperty]];
                
            }
            
            
        } else if ([KVCBaseObject isPropertyTypeBasic:propType]) {
            
            id basicValue = [self valueForKey:currentProperty];
            if (basicValue == nil) {
                basicValue = @"";
            }
            [resultDict setValue:basicValue forKey:[self customKeyForPropertyName:currentProperty]];
            
        } else {
            
            id kvcChild = [self valueForKey:currentProperty];
            if (kvcChild == nil) {
                kvcChild = [[KVCBaseObject alloc] init];
            }
            if ([kvcChild isKindOfClass:[KVCBaseObject class]]) {
                NSDictionary * childDict = [kvcChild objectToDictionary:ignoreFields];
                [resultDict setValue:childDict forKey:[self customKeyForPropertyName:currentProperty]];
            }
            
        }
        
    }
    return resultDict;
}

- (NSString *)objectToJson {
    return [self objectToJson:@""];
}


- (NSString *)objectToJson:(NSString*)ignoreFields
{
    NSDictionary* dict=[self objectToDictionary:ignoreFields];
    return [dict JSONRepresentation];
}


@end
