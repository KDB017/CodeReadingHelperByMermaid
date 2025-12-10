
import { BaseAnalyzer } from "../base-analyzer";
/**
 * this is the python analyzer class for RegExp
 */
export class PythonAnalyzer extends BaseAnalyzer {

    /**
     * the regex pattern for searching function definition in python
     */
    public static readonly pattern =(`([ \t]*)(?:async\\s+)?def\\s+${BaseAnalyzer.FUNCTION_NAME_PLACEHOLDER}\\s*(?:\\[.*?\\])?\\s*\\(`);
    
    /**
     * the file extensions for python files
     */
    public static readonly EXTENSIONS = ["py"];
    constructor() {
        super();
    }

    /**
     * returns the regex for searching function definition in python
     * @param functionName 
     * @returns 
     */
    public getSearchRegex(functionName: string): RegExp {
        const pythonRegExp = PythonAnalyzer.pattern.replace(
            BaseAnalyzer.FUNCTION_NAME_PLACEHOLDER, 
            functionName
        );
        return new RegExp(pythonRegExp, 'm');
    }
}