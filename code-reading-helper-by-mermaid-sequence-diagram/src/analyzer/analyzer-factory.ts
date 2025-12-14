
import { ICodeAnalyzer } from "./interface/code-analyzer-interface";
import { PythonAnalyzer } from "./concrete-analyzer/python-analyzer";
import { JavaAnalyzer } from "./concrete-analyzer/java-analyzer";
import { JavaScriptAnalyzer } from "./concrete-analyzer/javascript-analyzer";
import { TypeScriptAnalyzer } from "./concrete-analyzer/typescript-analyzer";
/**
 * factory class for analyzers based on file extensions.
 */
export class AnalyzerFactory {

    private static readonly SUPPORTED_EXTENSIONS = [
        ...PythonAnalyzer.EXTENSIONS,
        ...JavaAnalyzer.EXTENSIONS,
        ...JavaScriptAnalyzer.EXTENSIONS,
        ...TypeScriptAnalyzer.EXTENSIONS
    ];

    /**
     * Analyzer factory method to get the appropriate analyzer based on file extension
     * @param fileExtension 
     * @returns 
     * @throws Error if file extension is not supported
     */
    public static getAnalyzerForFile(fileExtension: string): ICodeAnalyzer {
        if (!fileExtension || fileExtension.trim() === '') {
            throw new Error('File extension is empty or undefined');
        }

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
        throw new Error(`Unsupported file extension: ${fileExtension}. Supported: ${this.SUPPORTED_EXTENSIONS.join(', ')}`);
    }

}