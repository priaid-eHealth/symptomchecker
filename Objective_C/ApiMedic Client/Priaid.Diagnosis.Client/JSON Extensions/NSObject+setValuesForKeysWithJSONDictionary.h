#import <Foundation/Foundation.h>

@interface NSObject (setValuesForKeysWithJSONDictionary)


- (void)setValuesForKeysWithJSONDictionary:(NSDictionary *)keyedValues dateFormatter:(NSDateFormatter *)dateFormatter exclusionList:(NSString*)exclusionList recursive:(bool)recursive;

@end
