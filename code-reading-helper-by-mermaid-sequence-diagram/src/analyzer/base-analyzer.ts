import { SearchResult } from "./interface/search-result-interface";
import { ICodeAnalyzer } from "./interface/code-analyzer-interface";
/**
 * this is the base analyzer class
 */
export abstract class BaseAnalyzer extends Object implements ICodeAnalyzer{

    /**
     * the placeholder for function name in regex pattern
     */
    public static readonly FUNCTION_NAME_PLACEHOLDER = "{FUNCTION_NAME}";

    /**
     * the regex pattern for searching function definition
     */
    protected patterns: string[];


    /**     * constructor
     * @param patterns 
     */
    constructor(patterns: string[]) {
        super();
        this.patterns = patterns;
    }

    /**
     * search the position of function definition in the text
     * @param text 
     * @param functionName 
     * @returns 
     */
    public searchFunctionPosition(text: string, functionName: string): SearchResult | null {
        return this.analyze(text, functionName);
    }

    /**
     * meta characters is escaped
     * @param aString
     * @returns escaped string
     */
    private escapeRegExp(functionName: string): string {
        return functionName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    protected getPatterns(): string[] {
        return this.patterns;
    }

    /**
     * analyze the text to find function definition position
     * @param text 
     * @param functionName 
     */
    protected analyze(text: string, functionName: string): SearchResult | null {
        const escapedFunctionName = this.escapeRegExp(functionName);
        for (const patternRegex of this.getSearchRegexes(escapedFunctionName)) {
            const match = patternRegex.exec(text);
            if (match) {
                console.log(`Match for function: ${functionName}`);
                return { index: match.index };
            }
        }
        return null;
    }

    /**
     * build regex list for all configured patterns
     * @param functionName 
     */
    protected  getSearchRegexes(functionName: string): RegExp[] {
        return this.getPatterns().map(pattern => {
            const  correctFunctionRegExp= pattern.replace(BaseAnalyzer.FUNCTION_NAME_PLACEHOLDER, functionName);
            return new RegExp(correctFunctionRegExp, 'm');
        });
    }



}