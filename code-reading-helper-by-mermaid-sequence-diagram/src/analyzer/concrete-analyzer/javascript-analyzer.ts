
import { BaseAnalyzer } from "../base-analyzer";

/**
 * this is the java script analyzer class for RegExp 
 */
export class JavaScriptAnalyzer extends BaseAnalyzer {

    /**
     * the regex pattern for searching function definition in javascript
     */
    // public static readonly pattern =`^([ \\t]*)(?:async[ \\t]+)?(?:function[ \\t]*\\*?[ \\t]*)?${BaseAnalyzer.FUNCTION_NAME_PLACEHOLDER}[ \\t]*\\(`;
    
    /**
     * the file extensions for javascript files
     */
    public static readonly EXTENSIONS = ["js", "jsx"];
    constructor() {
        super(`^([ \\t]*)(?:async[ \\t]+)?(?:function[ \\t]*\\*?[ \\t]*)?${BaseAnalyzer.FUNCTION_NAME_PLACEHOLDER}[ \\t]*\\(`);
    }

    /**
     * returns the regex for searching function definition in javascript
     * @param functionName 
     * @returns 
     */
    public getSearchRegex(functionName: string): RegExp {
        const pattern = this.getPattern();
        const javaScriptRegExp = pattern.replace(
            BaseAnalyzer.FUNCTION_NAME_PLACEHOLDER, 
            functionName
        );
        return new RegExp(javaScriptRegExp, 'm');
    }
}