
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
        // regex explanation:
        // ([ \t]*)                 --> matches any number of spaces or tabs at the beginning of the line
        // (?:async\s+)?            -->  matches the 'async' keyword 
        // def\s+                    --> matches the 'def' keyword 
        // ${BaseAnalyzer.FUNCTION_NAME_PLACEHOLDER} --> placeholder for the function name to be inserted later
        // \s*(?:\[.*?\])?          --> matches type 
        // \s*\(                     --> matches left parenthesis '('
        super(`([ \t]*)(?:async\\s+)?def\\s+${BaseAnalyzer.FUNCTION_NAME_PLACEHOLDER}\\s*(?:\\[.*?\\])?\\s*\\(`);
    }

    /**
     * returns the regex for searching function definition in python
     * @param functionName 
     * @returns 
     */
    public getSearchRegex(functionName: string): RegExp {
        const pattern = this.getPattern();
        const pythonRegExp = pattern.replace(
            BaseAnalyzer.FUNCTION_NAME_PLACEHOLDER, 
            functionName
        );
        return new RegExp(pythonRegExp, 'm');
    }
}