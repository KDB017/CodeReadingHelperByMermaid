import typescriptEslint from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";

export default [
    {
        files: ["src/**/*.ts"],
        ignores: ["src/test/**/*.ts", "src/**/*.test.ts"], // テストファイルを除外
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
                    format: ["camelCase"],
                    filter: {
                        regex: "^_",
                        match: false,
                    },
                },
            ],
            "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
            "@typescript-eslint/explicit-function-return-type": "warn",
            "@typescript-eslint/no-non-null-assertion": "warn",
            // 型情報が必要なルールをコメントアウト
            // "@typescript-eslint/prefer-nullish-coalescing": "error",
            // "@typescript-eslint/prefer-optional-chain": "error",
            // "@typescript-eslint/no-unnecessary-type-assertion": "error",
            // "@typescript-eslint/no-floating-promises": "error",
            // "@typescript-eslint/await-thenable": "error",
            // "@typescript-eslint/no-misused-promises": "error",
            
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
    {
        ignores: [
            "out/**",
            "dist/**",
            "node_modules/**",
        ]
    }
];