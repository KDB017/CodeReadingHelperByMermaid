
import { BaseAnalyzer } from "../base-analyzer";

/**
 * this is the typescript analyzer class for RegExp
 */
export class TypeScriptAnalyzer extends BaseAnalyzer {

    /**
     * the regex pattern for searching function definition in typescript
     * Matches: function declarations and class methods only
     * Handles: basic generics, nested generics, complex type constraints, function types, constructor types
     */
    public static readonly pattern = 
        `^([ \t]*)(export\\s+)?(?:(?:public|protected|private|static|abstract|async)\\s+)*(?:function\\s+)?${BaseAnalyzer.FUNCTION_NAME_PLACEHOLDER}(?:<(?:[^<>]|=>|<[^<>]*(?:<[^<>]*>[^<>]*)*>)*>)?[ \\t]*\\(`                                                                                                   // opening parenthesis
    
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