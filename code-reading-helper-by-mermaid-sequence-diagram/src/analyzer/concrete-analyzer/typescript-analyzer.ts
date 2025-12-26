
import { BaseAnalyzer } from "../base-analyzer";

/**
 * this is the typescript analyzer class for RegExp
 */
export class TypeScriptAnalyzer extends BaseAnalyzer {

    /**
     * the regex pattern for searching function definition in typescript for RegExp
     */
    // public static readonly PATTERN = 
    //     `^([ \t]*)(export\\s+)?(?:(?:public|protected|private|static|abstract|async)\\s+)*(?:function\\s+)?${BaseAnalyzer.FUNCTION_NAME_PLACEHOLDER}(?:<(?:[^<>]|=>|<[^<>]*(?:<[^<>]*>[^<>]*)*>)*>)?[ \\t]*\\(`                                                                                                   // opening parenthesis
    
    /**
     * the file extensions for typescript files
     */
    public static readonly EXTENSIONS = ["ts", "tsx"];

    constructor() {
        super([
            //function pattern
            `^([ \t]*)((export|async|default)\\s+)*function\\s*(\\*\\s*)?${BaseAnalyzer.FUNCTION_NAME_PLACEHOLDER}(<([^<>]|=>|<[^<>]*>)*>)?[ \t]*\\(`,
            `^([ \t]*)((public|protected|private|static|async|override|get|set)\\s+)*(\\*\\s*)?${BaseAnalyzer.FUNCTION_NAME_PLACEHOLDER}(<([^<>]|=>|<[^<>]*>)*>)?[ \t]*\\(`,
            `^([ \t]*)(export\\s+)?((const|let|var)\\s+)?${BaseAnalyzer.FUNCTION_NAME_PLACEHOLDER}\\s*=\\s*(async\\s*)?\\([^)]*\\)\\s*=>`,
        ]);;
    }

    
}