
import { SearchResult } from './search-result-interface';
/**
 * this is the interface for code analyzer
 * if AST parsing is needed in future, we can extend and use this interface, if  BaseAnalyzer don't extendes it.
 */
export interface ICodeAnalyzer {
    /**
     * find the position of function definition in the text
     * @param text 
     * @param functionName 
     */
    searchFunctionPosition(text: string, functionName: string): SearchResult | null;

}