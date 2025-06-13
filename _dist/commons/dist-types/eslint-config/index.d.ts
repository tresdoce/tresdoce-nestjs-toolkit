export declare const eslintConfig: () => {
    parser: string;
    parserOptions: {
        project: string;
        sourceType: string;
    };
    plugins: string[];
    extends: string[];
    root: boolean;
    env: {
        node: boolean;
        jest: boolean;
    };
    ignorePatterns: string[];
    rules: {
        '@typescript-eslint/interface-name-prefix': string;
        '@typescript-eslint/explicit-function-return-type': string;
        '@typescript-eslint/explicit-module-boundary-types': string;
        '@typescript-eslint/no-explicit-any': string;
        '@typescript-eslint/no-var-requires': string;
        '@typescript-eslint/no-require-imports': string;
    };
};
