
import { ICodeAnalyzer } from "./interface/code-analyzer-interface";
import { PythonAnalyzer } from "./concrete-analyzer/python-analyzer";
import { JavaAnalyzer } from "./concrete-analyzer/java-analyzer";
import { JavaScriptAnalyzer } from "./concrete-analyzer/javascript-analyzer";
import { TypeScriptAnalyzer } from "./concrete-analyzer/typescript-analyzer";
/**
 * factory class for analyzers based on file extensions.
 */
export class AnalyzerFactory {

    /**
     * Analyzer factory method to get the appropriate analyzer based on file extension
     * @param fileExtension 
     * @returns 
     */
    public static getAnalyzerForFile(fileExtension: string): ICodeAnalyzer{
       if (PythonAnalyzer.EXTENSIONS.includes(fileExtension)) {
           return new PythonAnalyzer();
       }
       if (JavaAnalyzer.EXTENSIONS.includes(fileExtension)) {
           return new JavaAnalyzer();
       }
       if (JavaScriptAnalyzer.EXTENSIONS.includes(fileExtension)) {
           return new JavaScriptAnalyzer();
       }
       if (TypeScriptAnalyzer.EXTENSIONS.includes(fileExtension)) {
           return new TypeScriptAnalyzer();
       }
       throw new Error(`Analyzer not implemented for file extension: ${fileExtension}`);
    }

}