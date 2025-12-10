
import { BaseAnalyzer } from "../base-analyzer";

/**
 * this is the typescript analyzer class
 */
export class TypeScriptAnalyzer extends BaseAnalyzer {

    /**
     * the regex pattern for searching function definition in typescript
     * Matches: function declarations and class methods only
     * Handles: basic generics, nested generics, complex type constraints, function types, constructor types
     */
    public static readonly pattern = 
        `^([ \t]*)` +                                                              // line start + indentation
        `(export\\s+)?` +                                                          // export keyword (optional)
        `(?:(?:public|protected|private|static|abstract|async)\\s+)*` +           // modifiers (optional, repeatable)
        `(?:function\\s+)?` +                                                      // function keyword (optional for methods)
        `${BaseAnalyzer.FUNCTION_NAME_PLACEHOLDER}` +                              // function/method name
        `(?:<(?:[^<>]|=>|<[^<>]*(?:<[^<>]*>[^<>]*)*>)*>)?` +                       // generics: handle =>, nested brackets, complex constraints
        `[ \\t]*\\(`;                                                               // opening parenthesis
    
    /**
     * the file extensions for typescript files
     */
    public static readonly EXTENSIONS = ["ts", "tsx"];
    constructor() {
        super();
    }

    /**
     * returns the regex for searching function definition in typescript
     * @param functionName 
     * @returns 
     */
    public getSearchRegex(functionName: string): RegExp {
        const typeScriptRegExp = TypeScriptAnalyzer.pattern.replace(
            BaseAnalyzer.FUNCTION_NAME_PLACEHOLDER, 
            functionName
        );
        return new RegExp(typeScriptRegExp, 'm');
    }
}