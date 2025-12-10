
import { BaseAnalyzer } from "../base-analyzer";

/**
 * this is the java analyzer class for RegExp
 */
export class JavaAnalyzer extends BaseAnalyzer {

    /**
     * the regex pattern for searching function definition in java
     */
    // public static readonly pattern =`^([ \t]*)(?:@[A-Za-z_][\\w\\.]*?(?:\\([^)]*\\))?\\s*)*(?:(?:public|protected|private|static|abstract|final|synchronized|native|strictfp)\\s+)*(?:<(?:(?:[^<>]|<[^<>]*>)*?)>\\s*)?(?:@[A-Za-z_][\\w\\.]*?(?:\\([^)]*\\))?\\s*)*(?:[A-Za-z_$][\\w.$<>?,\\s@\\[\\]]*?)\\s+${BaseAnalyzer.FUNCTION_NAME_PLACEHOLDER}\\s*\\(`;
    
    /**
     * the file extensions for java files
     */
    public static readonly EXTENSIONS = ["java"];
    constructor() {
        super(`^([ \t]*)(?:@[A-Za-z_][\\w\\.]*?(?:\\([^)]*\\))?\\s*)*(?:(?:public|protected|private|static|abstract|final|synchronized|native|strictfp)\\s+)*(?:<(?:(?:[^<>]|<[^<>]*>)*?)>\\s*)?(?:@[A-Za-z_][\\w\\.]*?(?:\\([^)]*\\))?\\s*)*(?:[A-Za-z_$][\\w.$<>?,\\s@\\[\\]]*?)\\s+${BaseAnalyzer.FUNCTION_NAME_PLACEHOLDER}\\s*\\(`);
    }

    /**
     * returns the regex for searching function definition in java
     * @param functionName 
     * @returns 
     */
    public getSearchRegex(functionName: string): RegExp {
        const pattern = this.getPattern();
        const javaRegExp = pattern.replace(
            BaseAnalyzer.FUNCTION_NAME_PLACEHOLDER, 
            functionName
        );
        return new RegExp(javaRegExp, 'm');
    }
}