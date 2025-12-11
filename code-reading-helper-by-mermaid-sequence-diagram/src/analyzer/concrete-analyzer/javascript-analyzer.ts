
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
        // regex explanation:
        // ^([ \t]*)                 --> matches the start of the line
        // (export\s*)?              --> matches the 'export' keyword 
        // (async\s*)?               --> matches the 'async' keyword 
        // (function\s*)?            --> matches the 'function' keyword
        // (\*\s*)?                  --> matches an asterisk (*) for generator functions 
        // ${BaseAnalyzer.FUNCTION_NAME_PLACEHOLDER} --> placeholder for the function name to be inserted later
        // [ \t]*\(                  --> matches left parenthesis '('
        super(`^([ \\t]*)(export\\s*)?(async\\s*)?(function\\s*)?(\\*\\s*)?${BaseAnalyzer.FUNCTION_NAME_PLACEHOLDER}[ \\t]*\\(`);
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