import { SearchResult } from "./interface/search-result-interface";
import { ICodeAnalyzer } from "./interface/code-analyzer-interface";
/**
 * this is the base analyzer class
 */
export abstract class BaseAnalyzer implements ICodeAnalyzer {

    /**
     * the placeholder for function name in regex pattern
     */
    protected static readonly FUNCTION_NAME_PLACEHOLDER = "{FUNCTION_NAME}";

    constructor() {
    }

    /**
     * search the position of function definition in the text
     * @param text 
     * @param functionName 
     * @returns 
     */
    public searchFunctionPosition(text: string, functionName: string): SearchResult | null {
        const escapedFunctionName = this.escapeRegExp(functionName);
        const pattern = this.getSearchRegex(escapedFunctionName);
        const match = pattern.exec(text);

        if (match) {

            console.log(`✅ MATCH FOUND for ${functionName} at index ${match.index}`);
            return { index: match.index };
        }

        return null;
    }

    /**
     * meta characters is escaped
     * @param aString
     * @returns escaped string
     */
    private escapeRegExp(aString: string) : string {
        return aString.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    /**
     * abstract method to get the regex for searching function definition
     * @param functionName - エスケープ済みの検索対象関数名
     */
    protected abstract getSearchRegex(functionName: string): RegExp;

}