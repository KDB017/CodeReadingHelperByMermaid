
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
            // method Definition pattern with support for annotations, modifiers, type parameters, and return types
            //but generics is one or double
        super(
            // first annotations not captured
            [`^([ \t]*)(?:@[A-Za-z_]*\\s*)*`+
            // second modifiers not captured
            `(?:(?:public|protected|private|static|final|synchronized|strictfp)\\s+)*`+
            // third TypeParameters not captured
            `(?:<(?:(?:[^<>]|<[^<>]*>)*?)>\\s*)?`+
            // fourth annotations not captured
            `(?:@[A-Za-z_]*\\s*)*`+
            // fifth return type not captured
            `(?:[A-Za-z_$]*)\\s*(?:<(?:(?:[^<>]|<[^<>]*>)*?)>\\s*)?`+
            // finally function name captured
            `${BaseAnalyzer.FUNCTION_NAME_PLACEHOLDER}\\s*\\(`]);
    }

}