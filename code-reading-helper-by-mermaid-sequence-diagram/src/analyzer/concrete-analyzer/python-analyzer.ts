
import { BaseAnalyzer } from "../base-analyzer";
/**
 * this is the python analyzer class for RegExp
 */
export class PythonAnalyzer extends BaseAnalyzer {

    /**
     * the regex pattern for searching function definition in python
     */
    // public static readonly pattern =(`([ \t]*)(?:async\\s+)?def\\s+${BaseAnalyzer.FUNCTION_NAME_PLACEHOLDER}\\s*(?:\\[.*?\\])?\\s*\\(`);

    /**
     * the file extensions for python files
     */
    public static readonly EXTENSIONS = ["py"];

    constructor() {
            // method Definition pattern 
            //but generics is one or double
        super([`([ \t]*)(async\\s+)?def\\s+${BaseAnalyzer.FUNCTION_NAME_PLACEHOLDER}\\s*`+
            // generics part not captured
            `(?:\\[(?:[^\\[\\]]|\\[[^\\[\\]]*\\])*\\]\\s*)?\\(`]);


    }
}