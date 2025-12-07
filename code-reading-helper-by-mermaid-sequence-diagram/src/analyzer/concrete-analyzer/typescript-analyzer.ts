
import { BaseAnalyzer } from "../base-analyzer";

/**
 * this is the typescript analyzer class
 */
export class TypeScriptAnalyzer extends BaseAnalyzer {

    /**
     * the regex pattern for searching function definition in typescript
     */
    public static readonly pattern =`^([ \\t]*)(?:async[ \\t]+)?(?:function[ \\t]*\\*?[ \\t]*)?${BaseAnalyzer.FUNCTION_NAME_PLACEHOLDER}[ \\t]*\\(`;
    
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