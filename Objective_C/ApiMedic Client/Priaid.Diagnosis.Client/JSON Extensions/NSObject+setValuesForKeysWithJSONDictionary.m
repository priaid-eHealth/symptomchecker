#import "NSObject+setValuesForKeysWithJSONDictionary.h"

#import <objc/runtime.h>

@implementation NSObject (setValuesForKeysWithJSONDictionary)

- (void)internalSetValuesForKeysWithJSONDictionary:(NSDictionary *)keyedValues dateFormatter:(NSDateFormatter *)internalDateFormatter classDef:(Class)classDef exclusionList:(NSString*)exclusionList recursive:(bool)recursive
{

    unsigned int propertyCount;
    objc_property_t *properties = class_copyPropertyList(classDef, &propertyCount);
    
    for (int i=0; i<propertyCount; i++) {
        objc_property_t property = properties[i];
        const char *propertyName = property_getName(property);
        
        NSString* prop=[NSString stringWithUTF8String:propertyName];
        if (exclusionList && [exclusionList containsString:prop])
        {
            NSLog(@"Ignoring property[%@] because of exclusion list [%@]",prop,exclusionList);
        }
        
        NSString *keyName = [NSString stringWithUTF8String:propertyName];
        
        id value = [keyedValues objectForKey:keyName];
        if (value != nil) {
            char *typeEncoding = NULL;
            typeEncoding = property_copyAttributeValue(property, "T");
            //DLog(@"setValuesForKeysWithJSONDictionary processing key [%@] [%s]",keyName,typeEncoding);
            if (typeEncoding == NULL) {
                continue;
            }
            switch (typeEncoding[0]) {
                case '@':
                {
                    // Object
                    Class class = nil;
                    if (strlen(typeEncoding) >= 3) {
                        char *className = strndup(typeEncoding+2, strlen(typeEncoding)-3);
                        class = NSClassFromString([NSString stringWithUTF8String:className]);
                        free(className);
                    }
                    // Check for type mismatch, attempt to compensate
                    if ([class isSubclassOfClass:[NSString class]] && [value isKindOfClass:[NSNumber class]]) {
                        value = [value stringValue];
                    } else if ([class isSubclassOfClass:[NSNumber class]] && [value isKindOfClass:[NSString class]]) {
                        // If the ivar is an NSNumber we really can't tell if it's intended as an integer, float, etc.
                        NSNumberFormatter *numberFormatter = [[NSNumberFormatter alloc] init];
                        [numberFormatter setNumberStyle:NSNumberFormatterDecimalStyle];
                        value = [numberFormatter numberFromString:value];
                    } else if ([class isSubclassOfClass:[NSDate class]] && [value isKindOfClass:[NSString class]] && (internalDateFormatter != nil)) {
                        id dvalue=nil;
                        if ([value length]>0)
                        {
                            //We do our own show here
                            [internalDateFormatter setDateFormat:@"EEE, dd MMM yyyy HH:mm:ss '+0000'"];
                            dvalue = [internalDateFormatter dateFromString:value];
                            if (dvalue==nil)
                            {
                                [internalDateFormatter setDateFormat:@"dd-MM-yyyy"];
                                dvalue = [internalDateFormatter dateFromString:value];
                            }
                            if (dvalue==nil)
                            {
                                [internalDateFormatter setDateFormat:@"dd-MM-yyyy HH:mm:ss"];
                                dvalue = [internalDateFormatter dateFromString:value];
                            }
                        }
                        
                        /*
                         if (dvalue==nil)
                         {
                         DLog(@"setValuesForKeysWithJSONDictionary date conversion FAILED for [%@]",value);
                         }
                         else
                         {
                         DLog(@"setValuesForKeysWithJSONDictionary date conversion succeeded for [%@] to [%@]",value,dvalue);
                         }
                         */
                        value = dvalue;
                    }
                    
                    break;
                }
                    
                case 'i': // int
                case 's': // short
                case 'l': // long
                case 'q': // long long
                case 'I': // unsigned int
                case 'S': // unsigned short
                case 'L': // unsigned long
                case 'Q': // unsigned long long
                case 'f': // float
                case 'd': // double
                case 'B': // BOOL
                {
                    if ([value isKindOfClass:[NSNull class]]) {
                        value=@"0";
                    }
                    if ([value isKindOfClass:[NSString class]]) {
                        NSNumberFormatter *numberFormatter = [[NSNumberFormatter alloc] init];
                        [numberFormatter setNumberStyle:NSNumberFormatterDecimalStyle];
                        value = [numberFormatter numberFromString:value];
                    }
                    break;
                }
                    
                case 'c': // char
                case 'C': // unsigned char
                {
                    if ([value isKindOfClass:[NSString class]]) {
                        char firstCharacter = [value characterAtIndex:0];
                        value = [NSNumber numberWithChar:firstCharacter];
                    }
                    break;
                }
                    
                default:
                {
                    break;
                }
            }
            NSLog(@"Setting %@ to %@",keyName,value);
            [self setValue:value forKey:keyName];
            free(typeEncoding);
        }
    }
    free(properties);
    if (recursive)
    {
        Class sc=[classDef superclass];
        NSLog(@"Recursive processing");
        if (sc && sc!=[NSObject class])
        {
            [self internalSetValuesForKeysWithJSONDictionary:keyedValues dateFormatter:internalDateFormatter classDef:sc exclusionList:exclusionList recursive:recursive];
        }
    }
}

- (void)setValuesForKeysWithJSONDictionary:(NSDictionary *)keyedValues dateFormatter:(NSDateFormatter *)dateFormatter exclusionList:(NSString*)exclusionList recursive:(bool)recursive
{
    NSDateFormatter *internalDateFormatter=nil;
    if (dateFormatter==nil)
    {
        NSDateFormatter* DF=[[NSDateFormatter alloc] init];
        [DF setLocale:[[NSLocale alloc] initWithLocaleIdentifier:@"en_US_POSIX"]];
        //        [parser setDateFormat:@"EEE, dd MMM yyyy HH:mm:ss '+0000'"];
        [DF setTimeZone:[NSTimeZone timeZoneWithName:@"UTC"]];
        internalDateFormatter=DF;
    }
    else
    {
        internalDateFormatter=dateFormatter;
    }
    [self internalSetValuesForKeysWithJSONDictionary:keyedValues dateFormatter:internalDateFormatter classDef:[self class] exclusionList:exclusionList recursive:recursive];

}

@end
