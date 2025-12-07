
import { BaseAnalyzer } from "../base-analyzer.js";
export class PythonAnalyzer extends BaseAnalyzer {

    public static pattern =(`([ \t]*)(?:async\\s+)?def\\s+${BaseAnalyzer.FUNCTION_NAME_PLACEHOLDER}\\s*(?:\\[.*?\\])?\\s*\\(`);
    
    public static readonly EXTENSIONS = ["py"];
    constructor() {
        super();
    }

    public getSearchRegex(functionName: string): RegExp {
        const pythonRegExp = PythonAnalyzer.pattern.replace(
            BaseAnalyzer.FUNCTION_NAME_PLACEHOLDER, 
            functionName
        );
        return new RegExp(pythonRegExp, 'm');
    }
}