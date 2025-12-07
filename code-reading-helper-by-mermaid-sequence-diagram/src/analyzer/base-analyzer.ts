import { SearchResult } from "./interface/search-result-interface";
import { ICodeAnalyzer } from "./interface/code-analyzer-interface";
import { TextDocument } from "vscode";

export abstract class BaseAnalyzer implements ICodeAnalyzer {


    protected static readonly FUNCTION_NAME_PLACEHOLDER = "{FUNCTION_NAME}";

    constructor() {
    }

    public searchFunctionPosition(text: string, functionName: string): SearchResult | null {
       // 1. 💡 抽象メソッドを通して、具象クラスからパターン定義を取得する
        const pattern = this.getSearchRegex(functionName);
        const match = pattern.exec(text);
        
        if (match) {

            console.log(`✅ MATCH FOUND for ${functionName} at index ${match.index}`);
            return { index: match.index }; // SearchResultの定義による
        }
        
        return null;
    }

    /**
     * @description 具象クラスが、検索対象の関数名に置き換えられる前の静的な正規表現パターンを返す。
     * @param functionName - エスケープ済みの検索対象関数名
     */
    protected abstract getSearchRegex(functionName: string): RegExp;

}