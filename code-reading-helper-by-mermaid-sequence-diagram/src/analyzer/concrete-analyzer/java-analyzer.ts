
import { BaseAnalyzer } from "../base-analyzer";

/**
 * this is the java analyzer class
 */
export class JavaAnalyzer extends BaseAnalyzer {

    /**
     * the regex pattern for searching function definition in java
     */
    public static readonly pattern =`^([ \t]*)(?:@[A-Za-z_][\\w\\.]*?(?:\\([^)]*\\))?\\s*)*(?:(?:public|protected|private|static|abstract|final|synchronized|native|strictfp)\\s+)*(?:<(?:(?:[^<>]|<[^<>]*>)*?)>\\s*)?(?:@[A-Za-z_][\\w\\.]*?(?:\\([^)]*\\))?\\s*)*(?:[A-Za-z_$][\\w.$<>?,\\s@\\[\\]]*?)\\s+${BaseAnalyzer.FUNCTION_NAME_PLACEHOLDER}\\s*\\(`;
    
    /**
     * the file extensions for java files
     */
    public static readonly EXTENSIONS = ["java"];
    constructor() {
        super();
    }

    /**
     * returns the regex for searching function definition in java
     * @param functionName 
     * @returns 
     */
    public getSearchRegex(functionName: string): RegExp {
        const javaRegExp = JavaAnalyzer.pattern.replace(
            BaseAnalyzer.FUNCTION_NAME_PLACEHOLDER, 
            functionName
        );
        return new RegExp(javaRegExp, 'm');
    }
}