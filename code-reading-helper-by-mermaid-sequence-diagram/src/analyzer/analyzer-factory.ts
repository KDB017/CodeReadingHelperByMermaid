
import { ICodeAnalyzer } from "./interface/code-analyzer-interface";
import { PythonAnalyzer } from "./concrete-analyzer/python-analyzer.js";
/**
 * factory class for analyzers based on file extensions.
 */
export class AnalyzerFactory {

    public static getAnalyzerForFile(fileExtension: string): ICodeAnalyzer{
       if (PythonAnalyzer.EXTENSIONS.includes(fileExtension)) {
           return new PythonAnalyzer();
       }
       throw new Error(`Analyzer not implemented for file extension: ${fileExtension}`);
    }

}