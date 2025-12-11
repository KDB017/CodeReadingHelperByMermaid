import typescriptEslint from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";
import js from "@eslint/js";

export default [
    // TypeScript files with TypeScript-specific rules
    {
        files: ["src/**/*.ts"],
        ignores: ["src/test/**/*.ts"],
        plugins: {
            "@typescript-eslint": typescriptEslint,
        },

        languageOptions: {
            parser: tsParser,
            ecmaVersion: 2022,
            sourceType: "module",
        },

        rules: {
            // TypeScript specific rules
            "@typescript-eslint/naming-convention": [
                "warn",
                {
                    selector: "import",
                    format: ["camelCase", "PascalCase"],
                },
                {
                    selector: "variableLike",
                    format: ["camelCase"],
                },
                {
                    selector: "typeLike",
                    format: ["PascalCase"],
                },
                {
                    selector: "property",
                    format: ["UPPER_CASE", "camelCase"],
                    filter: {
                        regex: "^_",
                        match: false,
                    },
                },
            ],
            "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
            "@typescript-eslint/explicit-function-return-type": "warn",
            "@typescript-eslint/no-non-null-assertion": "warn",

            // General JavaScript/TypeScript rules
            "curly": "warn",
            "eqeqeq": "warn",
            "no-throw-literal": "warn",
            "semi": "warn",
            "prefer-const": "error",
            "no-var": "error",
            "no-console": "warn",
            "no-debugger": "error",
        },
    },
    // JavaScript files with basic JavaScript rules
    {
        files: ["media/**/*.js"],
        
        languageOptions: {
            ecmaVersion: 2022,
            sourceType: "module",
        },
        ...js.configs.recommended,
        rules: {

            "curly": "warn",
            "eqeqeq": "warn",
            "no-throw-literal": "warn",
            "semi": "warn",
            "prefer-const": "error",
            "no-var": "error",
            "no-console": "warn",
            "no-debugger": "error",
        },
    },
    {
        ignores: [
            "out/**",
            "dist/**",
            "node_modules/**",
        ]
    }
];