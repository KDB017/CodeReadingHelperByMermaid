
import { BaseAnalyzer } from "../base-analyzer";

/**
 * this is the typescript analyzer class
 */
export class TypeScriptAnalyzer extends BaseAnalyzer {

    /**
     * the regex pattern for searching function definition in typescript
     * Matches: function declarations and class methods only
     */
    public static readonly pattern = 
        `^([ \\t]*)` +                                                              // line start + indentation
        `(?:(?:export|default|public|protected|private|static|async|declare|abstract|readonly|override)[ \\t]+)*` +  // modifiers (optional, repeatable)
        `(?:function[ \\t]+)?` +                                                    // function keyword (optional for methods)
        `\\*?[ \\t]*` +                                                             // generator * (optional)
        `${BaseAnalyzer.FUNCTION_NAME_PLACEHOLDER}` +                               // function/method name
        `(?:[ \\t]*<[^>]*>)?` +                                                     // generics <T> (optional, simplified)
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