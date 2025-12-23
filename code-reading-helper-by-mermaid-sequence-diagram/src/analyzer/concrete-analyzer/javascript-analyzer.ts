
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
        // method Definition pattern
    constructor() {
        super([`^([ \\t]*)(export\\s*)?(default\\s*)?(static\\s*)?((async|set|get)\\s*)?(function\\s*)?(\\*\\s*)?${BaseAnalyzer.FUNCTION_NAME_PLACEHOLDER}[ \\t]*\\(`,
            // variable assigned arrow function
            `^([ \\t]*)(export\\s+)?((const|let|var)\\s+)?${BaseAnalyzer.FUNCTION_NAME_PLACEHOLDER}\\s*=\\s*(async\\s*)?\\([^)]*\\)\\s*=>`,


        ]);
    }
}