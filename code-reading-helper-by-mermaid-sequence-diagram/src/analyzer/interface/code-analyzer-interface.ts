/**
 * 
 */
import { SearchResult } from './search-result-interface';

export interface ICodeAnalyzer {

    searchFunctionPosition(text: string, functionName: string): SearchResult | null;

}